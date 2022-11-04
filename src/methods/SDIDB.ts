import AsyncConstructor from "./AsyncConstructor";
import isSame from "./isSame";
import removeItem from "./removeItem";
import type { StringKeys, PickByType, SeparationArrayProperty } from "../typings/utils";

let __DB__: Record<string, IDBDatabase> = {}; // 数据库，增删改查都在它身上进行

type OpenDBMap = "create" | "remove";

interface DefineIndexOption<KeyNames extends string> {
    path?: KeyNames | KeyNames[];
    unique?: boolean;
    multiEntry?: boolean;
}
type Index<KeyNames extends string> = Record<
    string,
    {
        path?: KeyNames | KeyNames[];
        unique?: boolean;
        multiEntry?: boolean;
    }
>;
interface DefineTableSetting<KeyNames extends string> {
    keypath?: string; // 数据库的主键 不指定时生成一个自增的主键
    index?: Index<KeyNames>;
}

/**
 * indexDB的封装 该类支持异步实例化
 * @example
 * const db = await new SDIDB("test")
 * // 或者
 * const db = new SDIDB()
 * await db.open("test")
 *
 * const table = await db.defineTable("table", ["id", "key", "key2"], {
 *  keyPath: "id", // 设置主键
 *  index: { index1: { path: ["key", "key2"] } }, // 设置索引
 * });
 * await table.insert({ id:"a", key:"key", key2:"key2" });
 * let row = await table.findByKeypath("a");
 */
export default class SDIDB extends AsyncConstructor {
    protected declare _version: number; // 数据库版本 打开数据库时异步获取
    protected declare _tableList: string[]; // 表名列表
    declare name: string;
    constructor(name?: string) {
        super(async () => {
            if (name) {
                this.name = name;
                await this.openDB();
            }
        });
    }

    /** 打开指定的数据库 如果异步实例化 不用调用该方法 */
    async open(dbname: string) {
        if (this.name != dbname) {
            this.name = dbname;
            await this.openDB();
            return this;
        } else {
            console.error("数据库" + dbname + "已打开");
        }
    }
    /** 关闭指定的数据库 */
    close(dbname: string) {
        __DB__[dbname].close();
    }

    /** 删除指定的表 */
    async removeTable(tableName: string) {
        // 如果有缓存 先把它关闭再重新升级建表
        if (this._tableList.includes(tableName)) {
            await this.openDB("remove", tableName);
        }
    }

    /** 创建一个新的表 该表只能通过一个自增的主键key查找数据 */
    async defineTable(tableName: string): Promise<IDBTable<any, any, any>>;
    /**
     * 创建新的表
     * 该表只能放入指定类型的对象
     * 索引：如果一个字段储存的是数组 只有将该字段设置为索引才能通过数组内元素直接查找
     * 如果不设置主键 会生成一个自增的主键key
     *
     * @parmars tableName 表名
     * @parmars settings 主键和索引
     */
    // prettier-ignore
    async defineTable<TableType extends object, KeyPath extends StringKeys<PickByType<TableType, string | number>>, IndexNames extends string>(tableName: string, settings?: { keypath?: KeyPath; index?: Record<IndexNames, DefineIndexOption<StringKeys<TableType>>> }): Promise<IDBTable<KeyPath, IndexNames, TableType>>;
    // prettier-ignore
    async defineTable<TableType extends object, KeyPath extends StringKeys<PickByType<TableType, string | number>>, IndexNames extends string>(tableName: string, settings?: { keypath?: KeyPath; index?: Record<IndexNames, DefineIndexOption<StringKeys<TableType>>> }) {
        if (!this._tableList.includes(tableName)) {
            // 如果有缓存 先把它关闭再重新触发升级建表
            await this.openDB("create", tableName, settings);
            //// 这里已经被openDB中success的on_versionchange代替
            //// if (this.__DB__) {this.__DB__.close(); this.__DB__ = null;}
        }
        return new IDBTable<KeyPath, IndexNames, TableType>(this.name, tableName, settings);
    }

    /** 删库跑路 */
    static deleteDB(dbname: string) {
        window.indexedDB.deleteDatabase(dbname);
    }

    // 向外部暴露的只读属性
    get version() {
        return this._version;
    }
    get tables() {
        return this._tableList;
    }

    /**
     * 打开或升级数据库
     * 打开时不需要参数
     * 升级只有两种情况，新建表或删除表
     */
    private async openDB(): Promise<void>;
    // prettier-ignore
    private async openDB<KeyNames extends string>(type: OpenDBMap, tableName: string, settings?: DefineTableSetting<KeyNames>): Promise<void>;
    // prettier-ignore
    private async openDB<KeyNames extends string>(type?: OpenDBMap, tableName?: string, settings: DefineTableSetting<KeyNames> = {}): Promise<void> {
        let DBRequest =
            type && this._version
                ? window.indexedDB.open(this.name, ++this._version)
                : window.indexedDB.open(this.name);

        DBRequest.onerror = () => {
            throw "数据库打开失败";
        };

        // 如果type有值则是建表或删表 没值就忽略这个过程
        if (type && tableName) {
            // onupgradeneeded 在这里面进行添加或删除表
            await this.onupgradeneeded(DBRequest, type, tableName, settings);
        }

        // onsuccess 打开数据库时初始化SDIDB的版本 表列表 缓存这个数据库
        await this.onsuccess(DBRequest);
    }

    //* 用来监听onupgradeneeded事件的函数 同时添加或删除表也是在里面进行
    private async onupgradeneeded<KeyNames extends string>(
        DBRequest: IDBOpenDBRequest,
        type: OpenDBMap,
        tableName: string,
        settings: DefineTableSetting<KeyNames>
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            DBRequest.onupgradeneeded = (e) => {
                const DB: IDBDatabase = (e.target as any).result;

                if (type == "create") {
                    const store = DB.createObjectStore(
                        tableName,
                        settings.keypath ? { keyPath: settings.keypath } : { autoIncrement: true }
                    );
                    // 设置索引 在查询时可以用索引查询
                    if (settings.index) {
                        const indexNames = Object.keys(settings.index);
                        for (const name of indexNames) {
                            store.createIndex(
                                name, // 索引名称
                                settings.index[name].path ?? name, // 索引对应的key
                                {
                                    unique: settings.index[name].unique ?? false, // 索引能否有重复值 默认为有
                                    multiEntry:
                                        settings.index[name].multiEntry ??
                                        Array.isArray(settings.index[name].path)
                                            ? false
                                            : true, // If true, the index will add an entry in the index for each array element when the keyPath resolves to an Array. If false, it will add one single entry containing the Array.
                                }
                            );
                        }
                    }
                } else if (type == "remove") {
                    DB.deleteObjectStore(tableName);
                }

                resolve(true);
            };
        });
    }

    private async onsuccess(DBRequest: IDBOpenDBRequest): Promise<boolean> {
        return new Promise((resolve, reject) => {
            DBRequest.onsuccess = (e) => {
                const DB: IDBDatabase = (e.target as any).result;
                // 在升级数据库时触发 关闭数据库 然后会用新版本重新打开 重新触发onsuccess
                DB.onversionchange = () => DB.close();
                __DB__[this.name] = DB; // 如果更新 DBcatch会关闭 要给它重新赋值
                this._version = DB.version;
                this._tableList = Array.from(DB.objectStoreNames);
                resolve(true);
            };
        });
    }
}

type FindOptions<IndexNames> = {
    query: IDBValidKey | IDBKeyRange;
    index: IndexNames;
    count?: number;
};
interface UpdateOptions<TableType extends object> {
    $set?: Partial<TableType>;
    $inc?: Partial<PickByType<TableType, number>>;
    $push?: Partial<SeparationArrayProperty<PickByType<TableType, any[]>>>;
    $pull?: Partial<SeparationArrayProperty<PickByType<TableType, any[]>>>;
}

/** 数据库表 通过调用SDIDB的defineTable返回函数获得 */
class IDBTable<KeyPath extends string, IndexNames extends string, TableType extends object> {
    protected store: IDBObjectStore;
    constructor(
        readonly dbName: string,
        readonly tableName: string,
        readonly tableSetting?: DefineTableSetting<StringKeys<TableType>>
    ) {
        this.store = __DB__[this.dbName].transaction(this.tableName, "readwrite").objectStore(this.tableName);
    }
    /**
     * 给表添加数据
     * @async
     * @param data 添加进表的数据 如果设定了主键必须为含主键的对象
     */
    async insert(value: TableType): Promise<boolean>;
    async insert(value: TableType, key: IDBValidKey): Promise<boolean>;
    async insert(value: TableType, key?: IDBValidKey) {
        // 插入前查看主键是否有重复
        if (this.keypath && !(await this.findByKeypath(value[this.keypath])).length) {
            return false;
        }
        await this.CURDHandler(this.store.add(value, key));
        return true;
    }

    /** 删除指定主键所在的数据 */
    async findByKeypathAndRemove(keyPath: string | number) {
        return await this.CURDHandler(this.store.delete(keyPath));
    }
    /** 删除索引找到的数据 */
    async findByIndexAndRemove(findOption: FindOptions<IndexNames>) {
        if (!this.keypath) throw false;
        const value = await this.findByIndex(findOption);
        for (const item of value) {
            const keypath = item[this.keypath];
            await this.CURDHandler(this.store.delete(keypath));
        }
        return true;
    }

    /**
     * 更新表数据
     * @param query 修改数据的查询，如果有多个结果只修改第一条
     * @param update 修改的数据 通过 `$set $push $pull $inc`在原有数据上修改
     * @param key 如果该表没有主键，会有一个自增长的主键key，把这个key放入，否则数据会被新增而不是更新
     */
    // prettier-ignore
    async update(query: TableType extends object ? Partial<TableType> : any, update: UpdateOptions<TableType>, key?: IDBValidKey) {
        let value = (await this.find(query))[0];

        for (const item in update) {
            changeProperties(value, update[item], item as keyof UpdateOptions<TableType>);
        }

        await this.CURDHandler( this.store.put(value, key));
        return value;
    }
    /** 通过主键查找数据并更新 返回更新后的数据 */
    async findByKeypathAndUpdate(query: string | number, update: UpdateOptions<TableType>) {
        let value = (await this.findByKeypath(query))[0];

        for (const item in update) {
            changeProperties(value, update[item], item as keyof UpdateOptions<TableType>);
        }

        await this.CURDHandler(this.store.put(value));
        return value;
    }
    /** 通过索引查找数据并更新 返回更新后的数据 */
    async findByIndexAndUpdate(query: FindOptions<IndexNames>, update: UpdateOptions<TableType>) {
        let value = (await this.findByIndex(query))[0];

        for (const item in update) {
            changeProperties(value, update[item], item as keyof UpdateOptions<TableType>);
        }

        await this.CURDHandler(this.store.put(value));
        return value;
    }

    /** 通过主键查找对应的数据 */
    async findByKeypath(keyPathValue: string | number): Promise<TableType[]> {
        const result = await this.CURDHandler(this.store.get(keyPathValue));
        return Array.isArray(result) ? result : [result];
    }
    /** 通过索引查找 */
    async findByIndex(findOption: FindOptions<IndexNames>): Promise<TableType[]> {
        const IDBrequest =
            findOption.count == 1
                ? this.store.index(findOption.index).get(findOption.query)
                : this.store.index(findOption.index).getAll(findOption.query, findOption.count);

        const result = await this.CURDHandler(IDBrequest);
        return Array.isArray(result) ? result : [result];
    }
    /** 查找符合条件的数据 性能远不如用主键或索引查找 */
    async find(query: TableType extends object ? Partial<TableType> : any): Promise<TableType[]> {
        const cursorFinder = this.store.openCursor();
        const keys = Object.keys(query);
        return new Promise((resolve, reject) => {
            const result: any[] = [];

            cursorFinder.onerror = () => {
                reject("查询失败");
            };

            cursorFinder.onsuccess = (e) => {
                const cursor: IDBCursorWithValue = (e.target as any).result;
                if (cursor) {
                    let isFind = true;
                    for (const key of keys) {
                        if (!isSame(cursor.value[key], query[key])) {
                            isFind = false;
                            break;
                        }
                    }
                    if (isFind) result.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };
        });
    }
    /**
     * 查找表中该键中有数据的行
     * 不放入参数会查找所有数据
     */
    async findAll(): Promise<TableType[]>;
    async findAll(key: StringKeys<TableType>): Promise<TableType[]>;
    async findAll(key?: StringKeys<TableType>) {
        const cursorFinder = this.store.openCursor();

        return new Promise((resolve, reject) => {
            const result: TableType[] = [];

            cursorFinder.onerror = () => {
                reject("查询失败");
            };

            if (key) {
                // 查找指定键
                cursorFinder.onsuccess = (e) => {
                    let cursor: IDBCursorWithValue = (e.target as any).result;
                    if (cursor) {
                        if (cursor.value[key]) {
                            result.push(cursor.value);
                        }
                        cursor.continue();
                    } else {
                        resolve(result);
                    }
                };
            } else {
                // 查找所有
                cursorFinder.onsuccess = (e) => {
                    let cursor: IDBCursorWithValue = (e.target as any).result;
                    if (cursor) {
                        result.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(result);
                    }
                };
            }
        });
    }

    /** 获得该表有多少条数据 */
    async count(): Promise<number>;
    /** 获得指定范围内的数据条数 */
    async count(key: KeyPath | IndexNames | IDBKeyRange): Promise<number>;
    async count(key?: KeyPath | IndexNames | IDBKeyRange) {
        return await this.CURDHandler(this.store.count(key));
    }

    /** 清除该表数据 */
    async clear() {
        let result = await this.CURDHandler(this.store.clear());
        return result ? false : true;
    }

    get keypath() {
        return this.tableSetting?.keypath;
    }
    get indexs() {
        return this.tableSetting && this.tableSetting.index
            ? Object.keys(this.tableSetting.index)
            : undefined;
    }

    private async CURDHandler(IDBRequest: IDBRequest) {
        return new Promise((resolve, reject) => {
            IDBRequest.onsuccess = (e) => {
                resolve((e.target as any).result);
            };
            IDBRequest.onerror = (e) => {
                reject((e.target as any).result);
            };
        });
    }
}

function changeProperties(changed: object, changedTo: object, methods: keyof UpdateOptions<any>): void {
    switch (methods) {
        case "$set":
            for (const key in changedTo) {
                changed[key] = changedTo[key];
            }
            break;
        case "$push":
            for (const key in changedTo) {
                changed[key].push(changedTo[key]);
            }
            break;
        case "$pull":
            for (const key in changedTo) {
                removeItem(changed[key], key, true);
            }
            break;
        case "$inc":
            for (const key in changedTo) {
                changed[key] += changedTo[key];
            }
            break;
    }
}

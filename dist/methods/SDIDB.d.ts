import AsyncConstructor from "./AsyncConstructor";
import type { StringKeys, PickByType, SeparationArrayProperty } from "../typings/utils";
interface DefineIndexOption<KeyNames extends string> {
    path?: KeyNames | KeyNames[];
    unique?: boolean;
    multiEntry?: boolean;
}
declare type Index<KeyNames extends string> = Record<string, {
    path?: KeyNames | KeyNames[];
    unique?: boolean;
    multiEntry?: boolean;
}>;
interface DefineTableSetting<KeyNames extends string> {
    keypath?: string;
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
    protected _version: number;
    protected _tableList: string[];
    name: string;
    constructor(name?: string);
    /** 打开指定的数据库 如果异步实例化 不用调用该方法 */
    open(dbname: string): Promise<this | undefined>;
    /** 关闭指定的数据库 */
    close(dbname: string): void;
    /** 删除指定的表 */
    removeTable(tableName: string): Promise<void>;
    /** 创建一个新的表 该表只能通过一个自增的主键key查找数据 */
    defineTable(tableName: string): Promise<IDBTable<any, any, any>>;
    /**
     * 创建新的表
     * 该表只能放入指定类型的对象
     * 索引：如果一个字段储存的是数组 只有将该字段设置为索引才能通过数组内元素直接查找
     * 如果不设置主键 会生成一个自增的主键key
     *
     * @parmars tableName 表名
     * @parmars settings 主键和索引
     */
    defineTable<TableType extends object, KeyPath extends StringKeys<PickByType<TableType, string | number>>, IndexNames extends string>(tableName: string, settings?: {
        keypath?: KeyPath;
        index?: Record<IndexNames, DefineIndexOption<StringKeys<TableType>>>;
    }): Promise<IDBTable<KeyPath, IndexNames, TableType>>;
    /** 删库跑路 */
    static deleteDB(dbname: string): void;
    get version(): number;
    get tables(): string[];
    /**
     * 打开或升级数据库
     * 打开时不需要参数
     * 升级只有两种情况，新建表或删除表
     */
    private openDB;
    private onupgradeneeded;
    private onsuccess;
}
declare type FindOptions<IndexNames> = {
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
declare class IDBTable<KeyPath extends string, IndexNames extends string, TableType extends object> {
    readonly dbName: string;
    readonly tableName: string;
    readonly tableSetting?: DefineTableSetting<StringKeys<TableType>> | undefined;
    protected store: IDBObjectStore;
    constructor(dbName: string, tableName: string, tableSetting?: DefineTableSetting<StringKeys<TableType>> | undefined);
    /**
     * 给表添加数据
     * @async
     * @param data 添加进表的数据 如果设定了主键必须为含主键的对象
     */
    insert(value: TableType): Promise<boolean>;
    insert(value: TableType, key: IDBValidKey): Promise<boolean>;
    /** 删除指定主键所在的数据 */
    findByKeypathAndRemove(keyPath: string | number): Promise<unknown>;
    /** 删除索引找到的数据 */
    findByIndexAndRemove(findOption: FindOptions<IndexNames>): Promise<boolean>;
    /**
     * 更新表数据
     * @param query 修改数据的查询，如果有多个结果只修改第一条
     * @param update 修改的数据 通过 `$set $push $pull $inc`在原有数据上修改
     * @param key 如果该表没有主键，会有一个自增长的主键key，把这个key放入，否则数据会被新增而不是更新
     */
    update(query: TableType extends object ? Partial<TableType> : any, update: UpdateOptions<TableType>, key?: IDBValidKey): Promise<TableType>;
    /** 通过主键查找数据并更新 返回更新后的数据 */
    findByKeypathAndUpdate(query: string | number, update: UpdateOptions<TableType>): Promise<TableType>;
    /** 通过索引查找数据并更新 返回更新后的数据 */
    findByIndexAndUpdate(query: FindOptions<IndexNames>, update: UpdateOptions<TableType>): Promise<TableType>;
    /** 通过主键查找对应的数据 */
    findByKeypath(keyPathValue: string | number): Promise<TableType[]>;
    /** 通过索引查找 */
    findByIndex(findOption: FindOptions<IndexNames>): Promise<TableType[]>;
    /** 查找符合条件的数据 性能远不如用主键或索引查找 */
    find(query: TableType extends object ? Partial<TableType> : any): Promise<TableType[]>;
    /**
     * 查找表中该键中有数据的行
     * 不放入参数会查找所有数据
     */
    findAll(): Promise<TableType[]>;
    findAll(key: StringKeys<TableType>): Promise<TableType[]>;
    /** 获得该表有多少条数据 */
    count(): Promise<number>;
    /** 获得指定范围内的数据条数 */
    count(key: KeyPath | IndexNames | IDBKeyRange): Promise<number>;
    /** 清除该表数据 */
    clear(): Promise<boolean>;
    get keypath(): string | undefined;
    get indexs(): string[] | undefined;
    private CURDHandler;
}
export {};

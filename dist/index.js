var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
class AsyncConstructor {
  constructor(asyncArrowFunction) {
    __publicField(this, "then");
    const init = (() => __async(this, null, function* () {
      yield Promise.resolve();
      yield asyncArrowFunction();
      delete this.then;
      return this;
    }))();
    this.then = init.then.bind(init);
  }
}
const isNull = (arg) => arg === null;
const isObject = (arg) => typeof arg == "object" && !Array.isArray(arg) && typeof arg !== "function" && arg !== null && !(arg instanceof RegExp);
const isRegExp = (arg) => arg instanceof RegExp;
function isSame(F, S, deep = false) {
  if (["number", "string", "bigint", "boolean", "undefined"].includes(typeof F)) {
    if (Number.isNaN(F) && Number.isNaN(S))
      return true;
    return F === S;
  }
  if (F === null && S === null)
    return true;
  if (isRegExp(F) && isRegExp(S))
    return F.source === S.source && F.flags === S.flags;
  if (typeof F === "function" && typeof S === "function")
    return F.toString() === S.toString();
  let FF = F, SS = S;
  const Fkeys = deep ? Reflect.ownKeys(FF) : Object.keys(FF);
  const Skeys = deep ? Reflect.ownKeys(SS) : Object.keys(SS);
  if (Fkeys.length != Skeys.length)
    return false;
  for (const key of Fkeys) {
    if (!Skeys.includes(key))
      return false;
    if (!isSame(FF[key], SS[key]))
      return false;
  }
  return true;
}
function deepClone(o, cache = /* @__PURE__ */ new WeakMap()) {
  if (window.structuredClone)
    return window.structuredClone(o);
  if (isRegExp(o) || isNull(o))
    throw "\u4F20\u5165\u7C7B\u578B\u9519\u8BEF";
  let result = Array.isArray(o) ? [] : /* @__PURE__ */ Object.create(null);
  if (cache.get(o)) {
    return cache.get(o);
  } else {
    cache.set(o, result);
    for (const key in o) {
      if (isObject(o[key])) {
        result[key] = deepClone(o[key], cache);
      } else {
        result[key] = o[key];
      }
    }
    Object.setPrototypeOf(result, Object.getPrototypeOf(o));
    return result;
  }
}
function removeItem(array, target, pullOrigin = false) {
  const arr = pullOrigin ? array : deepClone(array);
  if (Array.isArray(target)) {
    for (let i = 0; i < arr.length; i++) {
      for (const value of target) {
        if (isSame(arr[i], value)) {
          arr.splice(i, 1);
          i--;
          break;
        }
      }
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (isSame(arr[i], target)) {
        arr.splice(i, 1);
        break;
      }
    }
  }
  return arr;
}
const __DB__ = {};
class SDIDB extends AsyncConstructor {
  constructor(name) {
    super(() => __async(this, null, function* () {
      if (name) {
        this._name = name;
        yield this.openDB();
      }
    }));
  }
  open(dbname) {
    return __async(this, null, function* () {
      if (this._name == void 0) {
        this._name = dbname;
        yield this.openDB();
        return this;
      }
    });
  }
  close() {
    __DB__[this.name].close();
  }
  removeTable(tableName) {
    return __async(this, null, function* () {
      if (this._tableList.includes(tableName)) {
        yield this.openDB("remove", tableName);
      }
    });
  }
  defineTable(tableName, settings) {
    return __async(this, null, function* () {
      if (!this._tableList.includes(tableName)) {
        yield this.openDB("create", tableName, settings);
      }
      return new IDBTable(this._name, tableName, settings);
    });
  }
  static deleteDB(dbname) {
    if (__DB__[dbname]) {
      __DB__[dbname].close();
      delete __DB__[dbname];
    }
    window.indexedDB.deleteDatabase(dbname);
  }
  get version() {
    return this._version;
  }
  get tables() {
    return this._tableList;
  }
  get name() {
    return this._name;
  }
  openDB(_0, _1) {
    return __async(this, arguments, function* (type, tableName, settings = {}) {
      let DBRequest = type && this._version ? window.indexedDB.open(this._name, ++this._version) : window.indexedDB.open(this._name);
      DBRequest.onerror = () => {
        throw "\u6570\u636E\u5E93\u6253\u5F00\u5931\u8D25";
      };
      if (type && tableName) {
        yield this.onupgradeneeded(DBRequest, type, tableName, settings);
      }
      yield this.onsuccess(DBRequest);
    });
  }
  onupgradeneeded(DBRequest, type, tableName, settings) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        DBRequest.onupgradeneeded = (e) => {
          var _a, _b, _c;
          const DB = e.target.result;
          if (type == "create") {
            const store = DB.createObjectStore(
              tableName,
              settings.keypath ? { keyPath: settings.keypath } : { autoIncrement: true }
            );
            if (settings.index) {
              const indexNames = Object.keys(settings.index);
              for (const name of indexNames) {
                store.createIndex(
                  name,
                  (_a = settings.index[name].path) != null ? _a : name,
                  {
                    unique: (_b = settings.index[name].unique) != null ? _b : false,
                    multiEntry: ((_c = settings.index[name].multiEntry) != null ? _c : Array.isArray(settings.index[name].path)) ? false : true
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
    });
  }
  onsuccess(DBRequest) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        DBRequest.onsuccess = (e) => {
          const DB = e.target.result;
          DB.onversionchange = () => DB.close();
          __DB__[this._name] = DB;
          this._version = DB.version;
          this._tableList = Array.from(DB.objectStoreNames);
          resolve(true);
        };
      });
    });
  }
}
class IDBTable {
  constructor(dbName, tableName, tableSetting) {
    __publicField(this, "store");
    this.dbName = dbName;
    this.tableName = tableName;
    this.tableSetting = tableSetting;
    this.store = __DB__[this.dbName].transaction(this.tableName, "readwrite").objectStore(this.tableName);
  }
  insert(value, key) {
    return __async(this, null, function* () {
      if (this.keypath && (yield this.findByKeypath(value[this.keypath])).length) {
        return false;
      }
      yield this.CURDHandler(this.store.add(value, key));
      return true;
    });
  }
  findByKeypathAndRemove(keyPath) {
    return __async(this, null, function* () {
      return yield this.CURDHandler(this.store.delete(keyPath));
    });
  }
  findByIndexAndRemove(findOption) {
    return __async(this, null, function* () {
      if (!this.keypath)
        throw false;
      const value = yield this.findByIndex(findOption);
      for (const item of value) {
        const keypath = item[this.keypath];
        yield this.CURDHandler(this.store.delete(keypath));
      }
      return true;
    });
  }
  update(query, update, key) {
    return __async(this, null, function* () {
      let value = (yield this.find(query))[0];
      for (const item in update) {
        changeProperties(value, update[item], item);
      }
      yield this.CURDHandler(this.store.put(value, key));
      return value;
    });
  }
  findByKeypathAndUpdate(query, update) {
    return __async(this, null, function* () {
      let value = (yield this.findByKeypath(query))[0];
      for (const item in update) {
        changeProperties(value, update[item], item);
      }
      yield this.CURDHandler(this.store.put(value));
      return value;
    });
  }
  findByIndexAndUpdate(query, update) {
    return __async(this, null, function* () {
      let value = (yield this.findByIndex(query))[0];
      for (const item in update) {
        changeProperties(value, update[item], item);
      }
      yield this.CURDHandler(this.store.put(value));
      return value;
    });
  }
  findByKeypath(keyPathValue) {
    return __async(this, null, function* () {
      const result = yield this.CURDHandler(this.store.get(keyPathValue));
      return result === void 0 ? [] : Array.isArray(result) ? result : [result];
    });
  }
  findByIndex(findOption) {
    return __async(this, null, function* () {
      const IDBrequest = findOption.count == 1 ? this.store.index(findOption.index).get(findOption.query) : this.store.index(findOption.index).getAll(findOption.query, findOption.count);
      const result = yield this.CURDHandler(IDBrequest);
      return result === void 0 ? [] : Array.isArray(result) ? result : [result];
    });
  }
  find(query) {
    return __async(this, null, function* () {
      const cursorFinder = this.store.openCursor();
      const keys = Object.keys(query);
      return new Promise((resolve, reject) => {
        const result = [];
        cursorFinder.onerror = () => {
          reject("\u67E5\u8BE2\u5931\u8D25");
        };
        cursorFinder.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            let isFind = true;
            for (const key of keys) {
              if (!isSame(cursor.value[key], query[key])) {
                isFind = false;
                break;
              }
            }
            if (isFind)
              result.push(cursor.value);
            cursor.continue();
          } else {
            resolve(result);
          }
        };
      });
    });
  }
  findAll(key) {
    return __async(this, null, function* () {
      const cursorFinder = this.store.openCursor();
      return new Promise((resolve, reject) => {
        const result = [];
        cursorFinder.onerror = () => {
          reject("\u67E5\u8BE2\u5931\u8D25");
        };
        if (key) {
          cursorFinder.onsuccess = (e) => {
            let cursor = e.target.result;
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
          cursorFinder.onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
              result.push(cursor.value);
              cursor.continue();
            } else {
              resolve(result);
            }
          };
        }
      });
    });
  }
  count(key) {
    return __async(this, null, function* () {
      return yield this.CURDHandler(this.store.count(key));
    });
  }
  clear() {
    return __async(this, null, function* () {
      let result = yield this.CURDHandler(this.store.clear());
      return result ? false : true;
    });
  }
  get keypath() {
    var _a;
    return (_a = this.tableSetting) == null ? void 0 : _a.keypath;
  }
  get indexs() {
    return this.tableSetting && this.tableSetting.index ? Object.keys(this.tableSetting.index) : void 0;
  }
  keypathObj(data) {
    if (this.keypath) {
      if (data.length) {
        const result = {};
        for (const item of data) {
          result[item[this.keypath]] = item;
        }
        return result;
      } else {
        return null;
      }
    } else {
      throw "\u9700\u8981\u8BBE\u7F6E\u4E3B\u952E";
    }
  }
  CURDHandler(IDBRequest) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        IDBRequest.onsuccess = (e) => {
          resolve(e.target.result);
        };
        IDBRequest.onerror = (e) => {
          reject(e.target.result);
        };
      });
    });
  }
}
function changeProperties(changed, changedTo, methods) {
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
export { SDIDB as default };

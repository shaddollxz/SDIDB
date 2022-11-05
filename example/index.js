import SDIDB from "../dist/index.js";
SDIDB.deleteDB("dbName");
// create database instance
const db = await new SDIDB("dbName");
// or
const _db = new SDIDB();
await _db.open("dbName");
// defined table
// just put a tablename, this table can save any data but search on it will be hard
const _table = await db.defineTable("tablename");
const table = await db.defineTable("tableName", {
    keypath: "str",
    index: {
        index: { path: ["num", "arr"] },
        arr: {}, // if indexname same with key, can put nothing
        // like arr: { path: "arr" }
    },
});
// then, operate on it
// add data
await table.insert({ str: "data_one", num: 1, arr: ["a", "b"], obj: { data: "aaa" } });
await table.insert({ str: "data_two", num: 2, arr: ["a", "c"], obj: { data: "bbb" } });
// find data
console.log(await table.findByKeypath("data_one"));
console.log(await table.findByIndex({ index: "arr", query: "a" })); // find array element
console.log(await table.find({ obj: { data: "aaa" } })); // find object
console.log(await table.findAll()); // find all
// update data
await table.findByKeypathAndUpdate("data_one", { $inc: { num: 1 }, $push: { arr: "new data" } });
// there are findByIndexAndUpdate update to do this
// remove data
await table.findByKeypathAndRemove("data_one");

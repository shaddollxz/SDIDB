使用`TypeScript`对`IndexDB`进行的二次封装，包含增删改查等重要功能

# Install

`npm install sdidb``yarn add sdidb``pnpm add sdidb`

# Usage

也可以在`example`中查看例子

```typescript
import SDIDB from "sdidb";

SDIDB.deleteDB("dbName");

// create database instance
const db = await new SDIDB("dbName");
// or
const _db = new SDIDB();
await _db.open("dbName");

// defined table
// just a tablename, can save any data but search will be hard
const _table = await db.defineTable("tablename");

interface TableType {
    str: string;
    num: number;
    arr: string[];
    obj: { data: string };
}

const table = await db.defineTable<TableType, "str", "index" | "arr">("tableName", {
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
console.log(await table.findAll());
// update data
await table.findByKeypathAndUpdate("data_one", { $inc: { num: 1 }, $push: { arr: "new data" } });
// there are findByIndexAndUpdate update to do this
// remove data
await table.findByKeypathAndRemove("data_one");

```


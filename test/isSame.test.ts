import isSame from "../src/methods/isSame";
import { describe, it, expect, vi } from "vitest";

describe("isSame", () => {
    it("基础类型", () => {
        expect(isSame("aaa", "bbb")).toBe(false);
        expect(isSame(NaN, NaN)).toBe(true);
        expect(isSame(undefined, NaN)).toBe(false);
        expect(isSame(undefined, undefined)).toBe(true);
        expect(isSame(1, "1")).toBe(false);
    });
    it("数组", () => {
        const arr1 = ["aaa", "bbb"];
        const arr2 = ["aaa", "bbb"];
        expect(isSame(arr1, arr2)).toBe(true);
        const arr3 = ["aaa", "ccc"];
        expect(isSame(arr1, arr3)).toBe(false);
    });
    it("对象", () => {
        const obj1 = { data: "data", number: 123 };
        const obj2 = { data: "data", number: 123 };
        expect(isSame(obj1, obj2)).toBe(true);
    });
    it("特殊对象", () => {
        expect(isSame(null, null)).toBe(true);

        const reg1 = /a/g;
        const reg2 = /a/g;
        expect(isSame(reg1, reg2)).toBe(true);
        const reg3 = /a/i;
        expect(isSame(reg1, reg3)).toBe(false);

        const func1 = () => {
            let a = "@";
        };
        const func2 = () => {
            let a = "@";
        };
        expect(isSame(func1, func2)).toBe(true);
    });
    it("复杂数组对象", () => {
        const arr1 = [
            "str",
            123,
            { aaa: "str", bbb: null },
            undefined,
            { aaaa: ["str", 123, { data: { data: { data: 123 }, reg: /aaa/g } }] },
        ];
        const arr2 = [
            "str",
            123,
            { aaa: "str", bbb: null },
            undefined,
            { aaaa: ["str", 123, { data: { data: { data: 123 }, reg: /aaa/g } }] },
        ];
        expect(isSame(arr1, arr2)).toBe(true);
        const arr3 = [
            "str",
            123,
            { aaa: "str", bbb: null },
            undefined,
            { aaaa: ["str", 123, { data: { data: { data: 123 }, reg: /aaa/g } }] },
            "",
        ];
        expect(isSame(arr1, arr3)).toBe(false);
    });
});

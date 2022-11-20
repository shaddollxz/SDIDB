import updateProperties from "../src/methods/updateProperties";
import { describe, it, expect, vi } from "vitest";

interface TestData {
    num: number;
    str: string;
    bol: boolean;
    arr: string[];
}
const testData: TestData = {
    num: 121,
    str: "string",
    bol: true,
    arr: ["1", "2", "3"],
};

describe("updateProperties", () => {
    it("基本类型", () => {
        expect(updateProperties(testData, { $inc: { num: 1 } }).num).toBe(122);
        expect(updateProperties(testData, { $inc: { num: -1 } }).num).toBe(120);
        expect(updateProperties(testData, { $mul: { num: 2 } }).num).toBe(242);
        expect(updateProperties(testData, { $anti: ["bol"] }).bol).toBe(false);
        expect(updateProperties(testData, { $concat: { str: "new" } }).str).toBe("stringnew");
    });
    it("数组", () => {
        let r = ["1", "2", "3", "4", "5"];
        expect(updateProperties(testData, { $push: { arr: "4" } }).arr).toEqual(["1", "2", "3", "4"]);
        expect(updateProperties(testData, { $push: { arr: ["4", "5"] } }).arr).toEqual(r);
        expect(updateProperties(testData, { $push: { arr: ["1"] } }).arr).toEqual(["1", "2", "3", "1"]);

        expect(updateProperties(testData, { $pop: { arr: 1 } }).arr).toEqual(["1", "2"]);
        expect(updateProperties(testData, { $pop: { arr: 2 } }).arr).toEqual(["1"]);
        expect(updateProperties(testData, { $pop: { arr: 20 } }).arr).toEqual([]);

        r = ["4", "5", "1", "2", "3"];
        expect(updateProperties(testData, { $unshift: { arr: "4" } }).arr).toEqual(["4", "1", "2", "3"]);
        expect(updateProperties(testData, { $unshift: { arr: ["4", "5"] } }).arr).toEqual(r);
        expect(updateProperties(testData, { $unshift: { arr: ["1"] } }).arr).toEqual(["1", "1", "2", "3"]);

        expect(updateProperties(testData, { $shift: { arr: 1 } }).arr).toEqual(["2", "3"]);
        expect(updateProperties(testData, { $shift: { arr: 2 } }).arr).toEqual(["3"]);
        expect(updateProperties(testData, { $shift: { arr: 20 } }).arr).toEqual([]);

        expect(updateProperties(testData, { $pull: { arr: ["2"] } }).arr).toEqual(["1", "3"]);
        expect(updateProperties(testData, { $pull: { arr: ["1", "2"] } }).arr).toEqual(["3"]);
        expect(updateProperties(testData, { $pull: { arr: "2" } }).arr).toEqual(["1", "3"]);
    });
});

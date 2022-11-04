import { isRegExp } from "../utils/typeCheck";

/**
 * 判断两个值是否相等 (无法判断set,map是否相同)
 * @param F 对比的值
 * @param S 对比的值
 * @param deep 是否比较不可遍历对象 如symbol做键的属性
 * @returns boolen
 */
export default function isSame(F: unknown, S: unknown, deep = false): boolean {
    // 判断基础类型
    if (["number", "string", "bigint", "boolean", "undefined"].includes(typeof F)) {
        if (Number.isNaN(F) && Number.isNaN(S)) return true;
        return F === S;
    }
    // 特殊对象
    if (F === null && S === null) return true;
    if (isRegExp(F) && isRegExp(S)) return F.source === S.source && F.flags === S.flags;
    if (typeof F === "function" && typeof S === "function") return F.toString() === S.toString();

    let FF = F as object,
        SS = S as object;

    const Fkeys = deep ? Reflect.ownKeys(FF) : Object.keys(FF);
    const Skeys = deep ? Reflect.ownKeys(SS) : Object.keys(SS);
    if (Fkeys.length != Skeys.length) return false;

    for (const key of Fkeys) {
        if (!Skeys.includes(key)) return false;
        if (!isSame(FF[key], SS[key])) return false;
    }
    return true;
}

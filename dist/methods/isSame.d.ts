/**
 * 判断两个值是否相等 (无法判断set,map是否相同)
 * @param F 对比的值
 * @param S 对比的值
 * @param deep 是否比较不可遍历对象 如symbol做键的属性
 * @returns boolen
 */
export default function isSame(F: unknown, S: unknown, deep?: boolean): boolean;

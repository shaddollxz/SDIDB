import { isRegExp, isNull, isObject } from "../utils/typeCheck";
/**
 * 深复制
 * @param o 要被复制的对象或数组
 * @returns 新的对象
 */
export default function deepClone(o: object, cache = new WeakMap()) {
    if (window.structuredClone) return window.structuredClone(o);
    if (isRegExp(o) || isNull(o)) throw "传入类型错误";

    let result: Array<any> | object = Array.isArray(o) ? [] : Object.create(null);

    if (cache.get(o)) {
        return cache.get(o);
    } else {
        cache.set(o, result); //* 将当前对象及克隆到的结果缓存，如果以后在缓存中找到当前对象，说明发生了循环引用
        for (const key in o) {
            if (isObject(o[key])) {
                result[key] = deepClone(o[key], cache);
            } else {
                (result[key] as any) = o[key];
            }
        }
        Object.setPrototypeOf(result, Object.getPrototypeOf(o)); //* 将克隆对象的原型放上去
        return result;
    }
}

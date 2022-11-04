import type { BaseType } from "../typings/utils";

export const isNumber = (arg: unknown): arg is number => typeof arg == "number";
export const isString = (arg: unknown): arg is string => typeof arg == "string";
export const isBoolen = (arg: unknown): arg is boolean => typeof arg == "boolean";
export const isSymbol = (arg: unknown): arg is symbol => typeof arg == "symbol";
export const isNull = (arg: unknown): arg is null => arg === null;
export const isUndefined = (arg: unknown): arg is undefined => arg === void 0;
export const isBaseType = (arg: unknown): arg is BaseType => typeof arg !== "object";
export const isFunc = (arg: unknown): arg is Function => typeof arg == "function";
export const isObject = (arg: unknown): arg is Object =>
    typeof arg == "object" &&
    !Array.isArray(arg) &&
    typeof arg !== "function" &&
    arg !== null &&
    !(arg instanceof RegExp);
export const isRegExp = (arg: unknown): arg is RegExp => arg instanceof RegExp;
export const isSameType = (arg: unknown, val: unknown): val is typeof arg => typeof arg == typeof val;

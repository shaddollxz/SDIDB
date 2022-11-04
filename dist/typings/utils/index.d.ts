export type { EitherOr } from "./EitherOr";

/** 基础类型 */
export type BaseType = number | string | boolean | bigint | symbol | null | undefined;

/** 只有数字的字符串 */
export type NumberString = `${number}`;

/** 比较两个类型是否相同，返回true false */
// prettier-ignore
export type Equal<T, U> = (<R>(arg: R extends T ? 1 : 2) => void) extends (<RR>(arg: RR extends U ? 1 : 2) => void) ? true : false;

/** if 推荐配合Equal使用 */
export type If<C extends boolean, T, F> = C extends true ? T : F;

/** 通过value的类型选择对象的属性 */
export type PickByType<T extends object, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/** 通过value的类型排除对象的属性 */
export type OmitByType<T extends object, U> = {
    [K in keyof T as T[K] extends U ? never : K]: T[K];
};
/** 返回泛型的value组成的联合类型 */
export type Values<T extends object> = T extends { [K in keyof T]: infer U } ? U : never;

/** 将元组转为联合类型 */
export type TupleToUnion<T extends any[]> = T extends Array<infer U> ? U : never;

/** 获取对象的字符串类型键 */
export type StringKeys<T extends object> = T extends { [K in infer R]?: any }
    ? R extends string
        ? R
        : never
    : never;

/** 将对象的数组属性转换为数组元素和数组 */
export type SeparationArrayProperty<T extends object, V = any> = {
    [K in keyof T]: T[K] extends infer V ? (V extends Array<any> ? V | V[number] : T[K]) : T[K];
};

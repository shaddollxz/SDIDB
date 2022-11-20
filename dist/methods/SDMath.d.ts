/**
 * 提供了Math方法的小数部分取值
 * 对浮点数运算和四舍五入等的支持
 */
export default class SDMath {
    /** 四舍五入 */
    static round: (number: string | number, precision?: number) => number;
    /** 向上取整 */
    static ceil: (number: string | number, precision?: number) => number;
    /** 向下取整 */
    static floor: (number: string | number, precision?: number) => number;
    /** 加法 */
    static add: (num1: number, num2: number) => number;
    /** 减法 */
    static sub: (num1: number, num2: number) => number;
    /** 乘法 */
    static mul: (num1: number, num2: number) => number;
    /** 除法 */
    static div: (num1: number, num2: number) => number;
}

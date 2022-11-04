import deepClone from "./deepClone";
import isSame from "./isSame";

/**
 * 从数组中删除指定的值
 */
export default function removeItem(array: any[], target: any[], pullOrigin?: boolean): any[];
export default function removeItem(array: any[], target: any, pullOrigin?: boolean): any[];
export default function removeItem(array: any[], target: any, pullOrigin: boolean = false) {
    const arr = pullOrigin ? array : deepClone(array);

    if (Array.isArray(target)) {
        for (let i = 0; i < arr.length; i++) {
            for (const value of target) {
                if (isSame(arr[i], value)) {
                    arr.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    } else {
        for (let i = 0; i < arr.length; i++) {
            if (isSame(arr[i], target)) {
                arr.splice(i, 1);
                break;
            }
        }
    }
    return arr;
}

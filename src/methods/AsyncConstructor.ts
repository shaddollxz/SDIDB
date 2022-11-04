/**
 * 通过继承该类让子类能够异步实例化
 *
 * @example
 * class Test extends AsyncConstructor {
 *      constructor(){
 *          super(async () => { ... })
 *      }
 * }
 * let test = await new Test()
 */
export default abstract class AsyncConstructor {
    private then?: PromiseLike<AsyncConstructor> | null; //* 这个then用来骗过await
    constructor(asyncArrowFunction: () => Promise<void>) {
        const init = (async (): Promise<AsyncConstructor> => {
            await Promise.resolve(); //* 在回调执行前开启一次微任务，回调里就能随意使用this
            await asyncArrowFunction();
            delete this.then;
            return this;
        })();
        this.then = (init as any).then.bind(init); //* 当其它的constructor中的值处理结束后触发then
    }
}

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
    private then?;
    constructor(asyncArrowFunction: () => Promise<void>);
}

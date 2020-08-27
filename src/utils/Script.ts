/**
 * Creates a script element from a certain source in the passed node selector.
 * If no selector is passed it will add the script element in the body.
 *
 * @example
 * ```
 * const script = new Script('https://example.com/script.js', '.container');
 * script.load().then(doSomething);
 *
 * // To clean up just call the remove method
 * script.remove();
 * ```
 */
class Script {
    private readonly script: HTMLScriptElement;
    private readonly src: string;
    private readonly node: string;

    constructor(src, node = 'body') {
        this.script = document.createElement('script');
        this.src = src;
        this.node = node;
    }

    public load = (): Promise<any> =>
        new Promise((resolve, reject) => {
            this.script.src = this.src;
            this.script.async = true;
            this.script.onload = resolve;
            this.script.onerror = () => {
                this.remove();
                reject(new Error(`Unable to load script ${this.src}`));
            };

            document.querySelector(this.node).appendChild(this.script);
        });

    public remove = () => this.script.remove();
}

export default Script;

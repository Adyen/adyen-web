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
    private readonly datasetAttributes: Record<string, string>;

    constructor(src, node = 'body', datasetAttributes: Record<string, string> = {}) {
        this.script = document.createElement('script');
        this.src = src;
        this.node = node;
        this.datasetAttributes = datasetAttributes;
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

            Object.assign(this.script.dataset, this.datasetAttributes);

            const container = document.querySelector(this.node);
            const addedScript = container.querySelector(`script[src="${this.src}"]`);

            if (addedScript) {
                addedScript.addEventListener('load', resolve);
            } else {
                container.appendChild(this.script);
            }
        });

    public remove = () => this.script.remove();
}

export default Script;

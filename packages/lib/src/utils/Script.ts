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
    private readonly attributes: Partial<HTMLScriptElement>;
    private readonly dataAttributes: Record<string, string | undefined>;

    constructor(src, node = 'body', attributes: Partial<HTMLScriptElement> = {}, dataAttributes: Record<string, string | undefined> = {}) {
        this.script = document.createElement('script');
        this.src = src;
        this.node = node;
        this.attributes = attributes;
        this.dataAttributes = dataAttributes;
    }

    public load = (): Promise<any> =>
        new Promise((resolve, reject) => {
            Object.assign(this.script, this.attributes);
            Object.assign(this.script.dataset, this.dataAttributes);

            this.script.src = this.src;
            this.script.async = true;
            this.script.onload = event => {
                this.script.setAttribute('data-script-loaded', 'true');
                resolve(event);
            };
            this.script.onerror = () => {
                this.remove();
                reject(new Error(`Unable to load script ${this.src}`));
            };

            const container = document.querySelector(this.node);
            const addedScript = container.querySelector(`script[src="${this.src}"]`);

            if (addedScript) {
                const isLoaded = addedScript.getAttribute('data-script-loaded');
                if (isLoaded) resolve(true);
                else addedScript.addEventListener('load', resolve);
            } else {
                container.appendChild(this.script);
            }
        });

    public remove = () => this.script.remove();
}

export default Script;

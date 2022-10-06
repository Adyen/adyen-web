import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

/**
 * Custom function used to verify if the object instance loaded by the script is available
 * in the browser context
 */
type ScriptInstanceValidator = () => boolean;

interface IScript {
    load(scriptInstanceValidator?: ScriptInstanceValidator): Promise<any>;
    remove(): HTMLScriptElement;
}

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
class Script implements IScript {
    private readonly src: string;
    private readonly node: string;
    private readonly attributes: Partial<HTMLScriptElement>;
    private readonly dataAttributes: Record<string, string | undefined>;

    private isScriptLoadCalled = false;
    private script: HTMLScriptElement;

    constructor(src, node = 'body', attributes: Partial<HTMLScriptElement> = {}, dataAttributes: Record<string, string | undefined> = {}) {
        this.src = src;
        this.node = node;
        this.attributes = attributes;
        this.dataAttributes = dataAttributes;
    }

    public load = (scriptInstanceValidator = () => true): Promise<void> => {
        if (this.isScriptLoadCalled) {
            if (process.env.NODE_ENV === 'development') console.warn(`[Warning] script.load called more than once for ${this.src}`);
            return;
        }

        return new Promise((resolve, reject) => {
            const handleOnLoad = () => {
                console.log('handleLoad');
                /**
                 * In certain scenarios (ex: slow network connection) the 'onload' is triggered but the 3rd party
                 * SDK instance isn't ready yet. This function handles this scenario in a more defensive way, which
                 * it tries to verify if the object is available couple of times before throwing an error.
                 */
                let attemptsToVerifyScriptObject = 0;
                const verifyIfScriptObjectIsAvailable = () => {
                    if (scriptInstanceValidator()) {
                        this.script.setAttribute('data-script-loaded', 'true');
                        return resolve();
                    }

                    if (++attemptsToVerifyScriptObject === 4) {
                        return reject(new AdyenCheckoutError('ERROR', "Script object wasn't load successfully"));
                    }
                    setTimeout(verifyIfScriptObjectIsAvailable, 500);
                };
                verifyIfScriptObjectIsAvailable();
            };

            const handleOnError = () => {
                this.remove();
                reject(new Error(`Unable to load script ${this.src}`));
            };

            this.isScriptLoadCalled = true;

            const scriptContainer: Element = document.querySelector(this.node);
            this.script = scriptContainer.querySelector(`script[src="${this.src}"]`);

            if (this.script && this.script.getAttribute('data-script-loaded')) {
                // Script element exists in the browser and is already loaded
                resolve();
                return;
            } else if (this.script) {
                // Script element exists in the browser, but it is not loaded yet. Use-case:  Multiple PayPal components in different parts of the screen.
                this.script.addEventListener('load', handleOnLoad);
                this.script.addEventListener('error', handleOnError);
                return;
            }

            // Script element doesn't exist in the browser, so we create it and append to the DOM tree
            this.script = document.createElement('script');
            Object.assign(this.script, this.attributes);
            Object.assign(this.script.dataset, this.dataAttributes);

            this.script.src = this.src;
            this.script.async = true;

            this.script.addEventListener('load', handleOnLoad);
            this.script.addEventListener('error', handleOnError);

            scriptContainer.appendChild(this.script);
        });
    };

    public remove = (): HTMLScriptElement => {
        return this.script.parentNode && this.script.parentNode.removeChild(this.script);
    };
}

export default Script;

import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';

interface IScript {
    load(): Promise<void>;
    remove(): void;
}

interface IScriptProps {
    src: string;
    node?: string;
    attributes?: Partial<HTMLScriptElement>;
    dataAttributes?: Record<string, string | undefined>;
}

class Script implements IScript {
    private readonly src: string;
    private readonly node: string;
    private readonly attributes: Partial<HTMLScriptElement>;
    private readonly dataAttributes: Record<string, string | undefined>;

    private script: HTMLScriptElement;
    private loadPromise: Promise<void> | null = null;
    private rejectLoadPromise: (reason?: any) => void | null = null;

    public static readonly RETRY_DELAY = 1000;
    public static readonly MAX_NUMBER_OF_RETRIES = 3;

    constructor({ src, node = 'body', attributes, dataAttributes }: IScriptProps) {
        this.src = src;
        this.node = node;
        this.attributes = attributes;
        this.dataAttributes = dataAttributes;
    }

    public load = (): Promise<void> => {
        if (this.loadPromise !== null) {
            if (process.env.NODE_ENV === 'development') console.warn(`[Warning] script.load called more than once for ${this.src}`);
            return this.loadPromise;
        }

        this.loadPromise = new Promise((resolve, reject) => {
            this.rejectLoadPromise = reject;
            let attempts = 0;

            const loadScriptWithRetry = async (): Promise<void> => {
                try {
                    attempts++;
                    await this.loadScript();
                    resolve();
                } catch (error: unknown) {
                    if (this.loadPromise === null) {
                        return;
                    }

                    this.removeScript();

                    if (attempts < Script.MAX_NUMBER_OF_RETRIES) {
                        setTimeout(() => void loadScriptWithRetry(), Script.RETRY_DELAY);
                    } else {
                        this.loadPromise = null;
                        this.rejectLoadPromise = null;
                        reject(error);
                    }
                }
            };

            void loadScriptWithRetry();
        });

        return this.loadPromise;
    };

    public remove = () => {
        this.rejectLoadPromise?.(new AdyenCheckoutError('CANCEL', 'Script loading cancelled.'));
        this.removeScript();
        this.loadPromise = null;
    };

    private removeScript() {
        this.script?.parentNode?.removeChild(this.script);
        this.script = null;
    }

    private loadScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            const scriptContainer = document.querySelector(this.node);

            if (!scriptContainer) {
                reject(new AdyenCheckoutError('SCRIPT_ERROR', `Unable to find script container node: ${this.node}`));
                return;
            }

            const cleanupListeners = () => {
                if (!this.script) return;
                this.script.removeEventListener('load', handleOnLoad);
                this.script.removeEventListener('error', handleOnError);
            };

            const handleOnLoad = () => {
                this.script.setAttribute('data-script-loaded', 'true');
                cleanupListeners();
                resolve();
            };

            const handleOnError = (errorEvent: ErrorEvent) => {
                cleanupListeners();
                reject(
                    new AdyenCheckoutError('SCRIPT_ERROR', `Unable to load script ${this.src}. Message: ${errorEvent.message}`, {
                        cause: errorEvent?.error || errorEvent
                    })
                );
            };

            this.script = scriptContainer.querySelector(`script[src="${this.src}"]`);

            // Script element exists in the browser and is already loaded
            if (this.script?.getAttribute('data-script-loaded')) {
                resolve();
                return;
            }

            // Script element exists in the browser, but it is not loaded yet
            // Use-case:  Multiple PayPal standalone components being loaded in different parts of the screen.
            if (this.script) {
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
    }
}

export default Script;

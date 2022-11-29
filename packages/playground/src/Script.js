class Script {
    constructor(src, node = 'body', attributes = {}, dataAttributes = {}) {
        this.script = document.createElement('script');
        this.src = src;
        this.node = node;
        this.attributes = attributes;
        this.dataAttributes = dataAttributes;
    }

    load = () =>
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

    remove = () => {
        return this.script.parentNode && this.script.parentNode.removeChild(this.script);
    };
}

export default Script;

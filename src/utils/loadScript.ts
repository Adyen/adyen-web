export const loadScript = (src, node = 'body') =>
    new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => {
            script.remove();
            reject(new Error(`Unable to load script ${src}`));
        };

        document.querySelector(node).appendChild(script);
    });

export default loadScript;

declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

interface Window {
    adyen: any;
}

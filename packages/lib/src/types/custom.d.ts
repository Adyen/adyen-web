declare module '*.module.scss' {
    const content: { [className: string]: string };
    export default content;
}

interface Window {
    VISA_SDK?: {
        buildClientProfile?(): any;
        correlationId?: string;
    };
}

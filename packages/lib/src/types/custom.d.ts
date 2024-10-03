declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
}

interface Window {
    AdyenWeb: any;
    VISA_SDK?: {
        buildClientProfile?(srciDpaId?: string): any;
        correlationId?: string;
    };
}

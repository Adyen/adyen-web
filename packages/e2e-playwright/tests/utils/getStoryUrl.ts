// todo: add type
interface IGetStoryUrl {
    baseUrl: string;
    componentConfig?: any;
    checkoutConfig?: any;
    sessionPayload?: any;
}

export const getStoryUrl = ({ baseUrl, componentConfig, checkoutConfig }: IGetStoryUrl) => {
    const query = (config, key) => (config ? `&${key}=${JSON.stringify(config)}` : '');
    return `${baseUrl}${query(checkoutConfig, 'checkoutConfiguration')}${query(componentConfig, 'componentConfiguration')}`;
};

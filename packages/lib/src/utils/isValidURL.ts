export const isValidHttpUrl = (httpUrl: string | null | undefined, allowHttp = false) => {
    if (!httpUrl) return false;

    let url: URL;
    try {
        url = new URL(httpUrl);
    } catch (_) {
        return false;
    }
    return allowHttp ? url.protocol === 'http:' || url.protocol === 'https:' : url.protocol === 'https:';
};

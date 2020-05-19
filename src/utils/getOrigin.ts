/**
 *  getOrigin - Used to retrieve the origin from a url
 *  Uses a regex to get origin (can't handle localhost origins -- which only occurs on dev)
 *  @param {string} url - URL\
 *  @return {string}
 */
export const getOrigin = (url: string): string => {
    const originRegex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
    const matches = originRegex.exec(url);

    if (!matches) return null;

    const [, protocol, separator, host, port] = matches;

    if (!protocol || !separator || !host) return null;

    return `${protocol}:${separator}${host}${port ? `:${port}` : ''}`;
};

export default getOrigin;

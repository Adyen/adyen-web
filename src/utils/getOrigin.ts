/**
 *  Used to retrieve the origin from a url
 *
 *  @remarks
 *  Uses a regex to get origin (can't handle localhost origins)
 *
 *  @param url - URL
 *  @returns The origin of the url
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

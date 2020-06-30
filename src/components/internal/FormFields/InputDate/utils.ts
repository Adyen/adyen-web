/**
 * Returns either the date input is supported or not in the current browser
 */
const checkDateInputSupport = (): boolean => {
    const input = document.createElement('input');
    input.setAttribute('type', 'date');
    return input.type === 'date';
};

/**
 * Returns a formatted date
 * @param value -
 * @example
 * formatDate('22111990');
 * // '22/11/1990'
 */
const formatDate = (value: string): string => {
    const date = value
        .replace(/\D|\s/g, '') // Digits only
        .replace(/^(00)(.*)?/, '01$2') // 00 -> 01
        .replace(/^(3[2-9])(.*)?/, '0$1$2') // 34 -> 03/04
        .replace(/^([4-9])(.*)?/, '0$1') // 4 -> 04
        .replace(/^([0-9]{2})(00)(.*)?/, '$101') // 01/00 -> 01/01
        .replace(/^(3[01])(02)(.*)?/, '29$2') // Force up to day 29 for Feb
        .replace(/^([0-9]{2})([2-9]|1[3-9])(.*)?/, '$10$2') // 01/4 -> 01/04
        .replace(/^([0-9]{2})([0-9]{2})([0-9])/, '$1/$2/$3') // 22111990 -> 22/11/1990
        .replace(/^([0-9]{2})([0-9])/, '$1/$2'); // 2211 -> 22/11

    const [day = '', month = '', year = ''] = date.split('/');

    // Check leap year
    if (year.length === 4 && day === '29' && month === '02' && (Number(year) % 4 !== 0 || (year.substr(2, 2) === '00' && Number(year) % 400 !== 0))) {
        return date.replace(/^29/, '28');
    }

    return date;
};

/**
 * Receives a formatted date and returns it as the API expects it
 * @param value -
 * @example
 * unformatDate('22/11/1990');
 * // '1990-11-22'
 */
const unformatDate = (value = ''): string => {
    if (value.indexOf('/') === -1) return value;
    const [day = '', month = '', year = ''] = value.split('/');
    if (!day || !month || !year) return null;
    return `${year}-${month}-${day}`;
};

export { checkDateInputSupport, formatDate, unformatDate };

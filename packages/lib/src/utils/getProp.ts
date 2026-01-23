import { hasOwnProperty } from './hasOwnProperty';

/**
 * returns the indicated property of an object, if it exists.
 *
 * @param object - The object to query
 * @param path - The property name or path to the property
 * @returns The value at `obj[p]`.

 * @example
 * ```
 *   getProp({x: 100}, 'x'); //=> 100
 *   getProp({}, 'x'); //=> undefined
 * ```
 */
function getProp(object: unknown, path: string): unknown {
    const splitPath = path.split('.');

    return splitPath.reduce<unknown>((xs, key) => {
        if (xs === null || xs === undefined) return undefined;
        if (typeof xs !== 'object') return undefined;
        const record = xs as Record<string, unknown>;
        return hasOwnProperty(record, key) ? record[key] : undefined;
    }, object);
}
export default getProp;

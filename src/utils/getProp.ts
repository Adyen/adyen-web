/**
 * returns the indicated property of an object, if it exists.
 *
 * @func
 * @memberOf R
 * @since v2.1.0
 *
 * @param {Object} object The object to query
 * @param {String} path The property name or path to the property
 * @return {*} The value at `obj[p]`.

 * @example
 *
 *      getProp({x: 100}, 'x'); //=> 100
 *      getProp({}, 'x'); //=> undefined
 */
const getProp = (object: any, path: string): any => {
    const splitPath = path.split('.');
    const reducer = (xs, x) => (xs && xs[x] ? xs[x] : undefined);

    return splitPath.reduce(reducer, object);
};

export default getProp;

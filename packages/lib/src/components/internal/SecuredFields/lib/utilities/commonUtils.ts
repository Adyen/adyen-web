/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 * @internal
 */
const objToString = Object.prototype.toString;

/**
 * Checks if `prop` is classified as an `Array` primitive or object.
 * @internal
 * @param prop - The value to check.
 * @returns Returns `true` if `prop` is correctly classified, else `false`.
 * @example
 * ```
 * isArray([1, 2, 3]);
 * // => true
 *
 * isArray(1);
 * // => false
 * ```
 */
export function isArray(prop) {
    return typeof prop === 'object' && prop !== null && Object.prototype.toString.call(prop) === '[object Array]';
}

/**
 * Generate random number using window.crypto if available - otherwise fall back toMath.random
 *
 * @returns Number
 */
export function generateRandomNumber() {
    if (!window.crypto) {
         
        return (Math.random() * 0x100000000) | 0;
    }

    const ranNum = new Uint32Array(1);
    window.crypto.getRandomValues(ranNum);
    return ranNum[0];
}

/**
 * wait
 *
 * Generic, Promise based, setTimeout call
 *
 * ms : Number - timeout value in milliseconds
 *
 * @example
 * ```
 * wait(5000).then(() => { runMyFunction() } ).catch(() => console.log('error with the timeout'));
 * ```
 */
// const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The function existy is meant to define the existence of something.
 * Using the loose inequality operator (!=), it is possible to distinguish between null, undefined, and everything else.
 * @internal
 * @param x -
 * @returns
 */
export function existy(x) {
    return x != null;
}

/**
 * Used to determine if something should be considered a synonym for true
 * NOTE: The number zero is considered “truthy” by design as is '' & `{}`.
 * If you wish to retain the behavior where 0 is a synonym for false, then do not use truthy where you might expect 0
 * So - returns true if something is not false, undefined or null
 * @internal
 * @param x -
 * @returns
 */
export function truthy(x) {
    return x !== false && existy(x);
}

/**
 * Checks if `value` is object-like.
 * (FROM lodash.3.10.1)
 * @internal
 * @param value - The value to check.
 * @returns Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
    return !!value && typeof value === 'object';
}

/**
 * Recursively compare 2 objects
 */
export function objectsDeepEqual(x, y) {
    const xType = typeof x;
    const yType = typeof y;
    if (x && y && xType === 'object' && xType === yType) {
        if (Object.keys(x).length !== Object.keys(y).length) {
            return false;
        }
        return Object.keys(x).every(key => objectsDeepEqual(x[key], y[key]));
    }
    return x === y;
}

/**
 * @internal
 * Checks if `value` is classified as a `Number` primitive or object.
 * NOTE: `Infinity`, `-Infinity`, and `NaN` are classified as numbers
 * (FROM lodash.3.10.1)
 * @param value - The value to check.
 * @returns Returns `true` if `value` is correctly classified, else `false`.
 * @example
 * ```
 * isNumber(8.4);
 * // => true
 *
 * isNumber(NaN);
 * // => true
 *
 * isNumber('8.4');
 * // => false
 * ```
 */
function isNumber(value) {
    const numberTag = '[object Number]';
    return typeof value === 'number' || (isObjectLike(value) && objToString.call(value) === numberTag);
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 * (FROM lodash.3.10.1)
 * @internal
 * @param value - The value to check.
 * @returns Returns `true` if `value` is correctly classified, else `false`.
 * @example
 * ```
 * isString('abc');
 * // => true
 *
 * isString(1);
 * // => false
 * ```
 */
function isString(value) {
    const stringTag = '[object String]';
    return typeof value === 'string' || (isObjectLike(value) && objToString.call(value) === stringTag);
}

/**
 * Returns true if x is:
 * null, undefined, false, 0, NaN, empty object or array, empty string
 * @param x -
 * @example
 * ```
 * falsy(0) // => true
 * falsy('') // => true
 * falsy({}) // => true
 * falsy([]) // => true
 * falsy(false) // => true
 * falsy(NaN) // => true
 * falsy(null) // => true
 * falsy(undefined) // => true
 *
 * falsy(1) // => false
 * falsy('d') // => false
 * falsy({type:"kin"}) // => false
 * falsy([6]) // => false
 * falsy(true) // => false
 * ```
 */
export function falsy(x) {
    // Is null, undefined or false
    if (!truthy(x)) {
        return true;
    }

    // = 0 || NaN
    if (isNumber(x)) {
        if (x === 0 || Number.isNaN(x)) {
            return true;
        }
    }

    // empty array or string
    if ((isArray(x) || isString(x)) && x.length === 0) {
        return true;
    }

    // empty object
    if (isObjectLike(x) && Object.keys(x).length === 0) {
        return true;
    }

    return false;
}

/**
 * Inverse of falsy - returns true if x is NOT null, undefined, false, 0, NaN, empty object or array, empty string
 * @param x -
 */
export function notFalsy(x) {
    return !falsy(x);
}

/**
 * This function allows us to partially apply any number of variables to functions that take any number of parameters.
 * @returns \{function(): *\}
 */
export function partial(...args) {
    // Store the args array
    const myArgs = args;

    // Grab the function (the first argument). myArgs now contains the remaining arguments
    const fn = myArgs.shift();

    // Return a function that calls fn with myArgs + whatever else is passed when this returned function is called
    function partialFn(...args2) {
        return fn.apply(this, myArgs.concat(args2));
    }
    return partialFn;
}

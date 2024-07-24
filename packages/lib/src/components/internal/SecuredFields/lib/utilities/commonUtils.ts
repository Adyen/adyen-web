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

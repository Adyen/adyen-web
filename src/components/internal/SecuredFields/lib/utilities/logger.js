/**
 * @internal
 * Utility class for logging messages/errors
 * Usage:
 * logger.log('Log message, always visible');
 *
 * For debug only messages:
 * window._b$dl && logger.log('Log message only visible on dev env');
 *
 * Or just use a conditional:
 * ```
 * if (window._b$dl) {
 *     logger.log('Log message only visible on dev env');
 * }
 * ```
 */

/**
 * @internal
 * Logs errors
 */
export const error = window.console && window.console.error && window.console.error.bind(window.console);

/**
 * @internal
 * Logs info
 */
export const info = window.console && window.console.info && window.console.info.bind(window.console);

/**
 * @internal
 * Logs
 * NOTE: changed to 'let' from 'const' for the purpose of running unit tests
 */
export let log = window.console && window.console.log && window.console.log.bind(window.console); // eslint-disable-line

/**
 * @internal
 * Logs warnings
 * NOTE: changed to 'let' from 'const' for the purpose of running unit tests
 */
export let warn = window.console && window.console.warn && window.console.warn.bind(window.console); // eslint-disable-line

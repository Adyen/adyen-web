import getProp from './getProp';

/**
 * @function collectBrowserInfo
 *
 * @desc Collects available frontend browser info and store it in the properties dictated by the EMVCo spec
 * (3DS_Spec_protocolAndCoreFny_v2-1_Oct2017.pdf)
 *
 * @example const browserInfo = collectBrowserInfo();
 * const userAgent = browserInfo.userAgent;
 *
 * @returns {Object} - browserInfo an object containing the retrieved browser properties
 */
export default function collectBrowserInfo() {
    const colorDepth = getProp(window, 'screen.colorDepth') || '';
    const javaEnabled = getProp(window, 'navigator.javaEnabled') ? window.navigator.javaEnabled() : false;
    const screenHeight = getProp(window, 'screen.height') || ''; // TODO: Shall we set this to null instead?
    const screenWidth = getProp(window, 'screen.width') || ''; // TODO: Shall we set this to null instead?
    const userAgent = getProp(window, 'navigator.userAgent') || '';

    // IE <+ 10 supports navigator.browserLanguage instead of navigator.language
    const language = getProp(window, 'navigator.language') || getProp(window, 'navigator.browserLanguage');

    const d = new Date();
    const timeZoneOffset = d.getTimezoneOffset();

    return {
        acceptHeader: '*/*',
        colorDepth,
        language,
        javaEnabled,
        screenHeight,
        screenWidth,
        userAgent,
        timeZoneOffset
    };
}

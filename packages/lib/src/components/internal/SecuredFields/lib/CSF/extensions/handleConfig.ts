import { getCardGroupTypes } from '../utils/getCardGroupTypes';
import { NON_CREDIT_CARD_TYPE_SECURED_FIELDS, SF_VERSION } from '../../configuration/constants';
import * as logger from '../../utilities/logger';
import { CSFSetupObject } from '../types';

/**
 * Parses this.props to set 'config' type vars on this (CSFComp)
 * - properties that just need to be set once, at startup, and then don't change
 *
 * See interface ConfigObject in types.ts
 */
export function handleConfig(props: CSFSetupObject): void {
    // --
    this.config.cardGroupTypes = getCardGroupTypes(props.cardGroupTypes);

    if (process.env.NODE_ENV === 'development' && window._b$dl) {
        logger.log('### StoreCls::init:: this.config.cardGroupTypes=', this.config.cardGroupTypes);
    }

    const loadingContext: string = props.loadingContext;

    if (!loadingContext) {
        logger.warn('WARNING Config :: no loadingContext has been specified!');
        return;
    }

    // Ensure passed loadingContext has trailing slash
    const lastChar = str => str.charAt(str.length - 1);
    this.config.loadingContext = lastChar(loadingContext) === '/' ? loadingContext : `${loadingContext}/`;

    // Is this for the regular creditCard or for another use-case for securedFields e.g. 'ach' or 'giftcard'
    this.config.isCreditCardType = NON_CREDIT_CARD_TYPE_SECURED_FIELDS.includes(props.type) === false;

    // Configuration object for individual txVariants - contains styling object values for securedFields inputs
    this.config.iframeUIConfig = props.iframeUIConfig;

    // By default CSF is allowed to add the encrypted element to the DOM - user of CSF must explicitly 'opt-out' to prevent this happening
    // (If either condition is true - then set allowedDOMAccess to false)
    this.config.allowedDOMAccess = !(props.allowedDOMAccess === false || props.allowedDOMAccess === 'false');

    // By default CSF is allowed to automatically shift focus from the date to CVC fields - user of CSF must explicitly 'opt-out' to prevent this happening
    this.config.autoFocus = !(props.autoFocus === false || props.autoFocus === 'false');

    // By default CSF will NOT perform a console.warn when receiving postMessages with origin or numKey mismatches - user of CSF must explicitly 'opt-in' to get this
    this.config.showWarnings = props.showWarnings === true || props.showWarnings === 'true';

    // By default CSF will strip the trailing separator character from valid credit card numbers - user of CSF must explicitly 'opt-out' to prevent this happening
    this.config.trimTrailingSeparator = !(props.trimTrailingSeparator === false || props.trimTrailingSeparator === 'false');

    // By default CSF is allowed to add a fix for iOS to force the keypad to retract - user of CSF must explicitly 'opt-out' to prevent this happening
    this.config.keypadFix = !(props.keypadFix === false || props.keypadFix === 'false');

    // To set the type on the iframe input fields to 'tel' c.f. the default 'text' (with inputmode='numeric')
    this.config.legacyInputMode = props.legacyInputMode || null;

    // To configure the minimum expiry date to a merchant defined value - this means the card has to be valid until at least this date
    this.config.minimumExpiryDate = props.minimumExpiryDate || null;

    // To distinguish between regular 'components' initiated securedField or 'custom' card component
    this.config.implementationType = props.implementationType;

    // Whether Component is collating errors into a single element for the screenreader & therefore whether indiv. SFs will have an aria-describedby attr
    this.config.isCollatingErrors = props.isCollatingErrors;

    this.config.sfLogAtStart = window._b$dl === true;

    let sfBundleType: string = this.config.isCreditCardType ? 'card' : props.type;
    if (sfBundleType.indexOf('sepa') > -1) sfBundleType = 'iban';

    // Add a hash of the origin to ensure urls are different across domains
    const d = btoa(window.location.origin);

    /**
     * Unless we are forcing the use of the compat version via card config
     * - detect Edge vn \<= 18 & IE11 - who don't support TextEncoder; and use this as an indicator to load a different, compatible, version of SF
     */
    const needsJWECompatVersion = props.forceCompat ? true : !(typeof window.TextEncoder === 'function');

    const bundleType = `${sfBundleType}${needsJWECompatVersion ? 'Compat' : ''}`; // e.g. 'card' or 'cardCompat'

    this.config.iframeSrc = `${this.config.loadingContext}securedfields/${props.clientKey}/${SF_VERSION}/securedFields.html?type=${bundleType}&d=${d}`;

    // TODO###### FOR QUICK LOCAL TESTING of sf
    if (process.env.NODE_ENV === 'development' && process.env.__SF_ENV__ !== 'build') {
        this.config.iframeSrc = `${process.env.__SF_ENV__}securedFields.${SF_VERSION}.html?type=${sfBundleType}`;
    }
    // TODO######

    this.config.maskSecurityCode = props.maskSecurityCode;
}

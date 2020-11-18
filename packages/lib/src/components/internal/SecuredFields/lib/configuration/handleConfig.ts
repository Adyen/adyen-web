import { getCardGroupTypes } from '../core/utils/getCardGroupTypes';
import { NON_CREDIT_CARD_TYPE_SECURED_FIELDS, SF_VERSION } from './constants';
import * as logger from '../utilities/logger';

/**
 * Parses this.props to set 'config' type vars on this (CSFComp)
 * - properties that just need to be set once, at startup, and then don't change
 *
 * See interface ConfigObject in types.ts
 */
export function handleConfig(): void {
    // --
    this.config.cardGroupTypes = getCardGroupTypes(this.props.cardGroupTypes);

    if (process.env.NODE_ENV === 'development' && window._b$dl) {
        logger.log('### StoreCls::init:: this.config.cardGroupTypes=', this.config.cardGroupTypes);
    }

    const loadingContext: string = this.props.loadingContext;

    if (!loadingContext) {
        logger.warn('WARNING Config :: no loadingContext has been specified!');
        return;
    }

    const lastChar = str => str.charAt(str.length - 1);

    // Ensure passed loadingContext has trailing slash
    this.config.loadingContext = lastChar(loadingContext) === '/' ? loadingContext : `${loadingContext}/`;

    this.config.isCreditCardType = NON_CREDIT_CARD_TYPE_SECURED_FIELDS.includes(this.props.type) === false;

    // Configuration object for individual txVariants
    // Contains styling object, placeholders & aria-label content for securedFields inputs
    this.config.iframeUIConfig = this.props.iframeUIConfig;

    // By default CSF is allowed to add the encrypted element to the DOM - user of CSF must explicitly 'opt-out' to prevent this happening
    // (If either condition is true - then set allowedDOMAccess to false)
    this.config.allowedDOMAccess = !(this.props.allowedDOMAccess === false || this.props.allowedDOMAccess === 'false');

    // By default CSF is allowed to automatically shift focus from the date to CVC fields - user of CSF must explicitly 'opt-out' to prevent this happening
    this.config.autoFocus = !(this.props.autoFocus === false || this.props.autoFocus === 'false');

    // By default CSF will NOT perform a console.warn when receiving postMessages with origin or numKey mismatches - user of CSF must explicitly 'opt-in' to get this
    this.config.showWarnings = this.props.showWarnings === true || this.props.showWarnings === 'true';

    // By default CSF will strip the trailing separator character from valid credit card numbers - user of CSF must explicitly 'opt-out' to prevent this happening
    this.config.trimTrailingSeparator = !(this.props.trimTrailingSeparator === false || this.props.trimTrailingSeparator === 'false');

    // By default CSF is allowed to add a fix for iOS to force the keypad to retract - user of CSF must explicitly 'opt-out' to prevent this happening
    this.config.keypadFix = !(this.props.keypadFix === false || this.props.keypadFix === 'false');

    this.config.sfLogAtStart = this.props._b$dl === true;

    let sfBundleType: string = this.config.isCreditCardType ? 'card' : this.props.type;
    if (sfBundleType.indexOf('sepa') > -1) sfBundleType = 'iban';

    // During the transition period accept clientKey & originKey, giving clientKey preference
    const accessKey: string = this.props.clientKey ? this.props.clientKey : this.props.originKey;
    // Add a hash of the origin to ensure urls are different across domains
    const d = btoa(window.location.origin);
    this.config.iframeSrc = `${this.config.loadingContext}securedfields/${accessKey}/${SF_VERSION}/securedFields.html?type=${sfBundleType}&d=${d}`;

    // TODO###### FOR QUICK LOCAL TESTING of sf
    if (process.env.NODE_ENV === 'development' && process.env.__SF_ENV__ !== 'build') {
        this.config.iframeSrc = `${process.env.__SF_ENV__}securedFields.${SF_VERSION}.html?type=${sfBundleType}`;
    }
    // TODO######
}

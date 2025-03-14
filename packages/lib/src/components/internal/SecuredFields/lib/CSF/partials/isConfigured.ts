import cardType from '../utils/cardType';
import { CardObject, CardConfigSuccessData } from '../../types';
import * as logger from '../../utilities/logger';
import { CVC_POLICY_REQUIRED } from '../../constants';
import { CSFThisObject } from '../types';

/**
 * @param csfState - comes from initial, partial, implementation
 * @param csfConfig - comes from initial, partial, implementation
 * @param csfProps - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 * @param validateForm - comes from initial, partial, implementation
 */
export function isConfigured({ csfState, csfConfig, csfProps, csfCallbacks }: CSFThisObject, validateForm): boolean {
    csfState.isConfigured = true;

    const callbackObj: CardConfigSuccessData = { iframesConfigured: true, type: csfState.type, rootNode: csfProps.rootNode as HTMLElement };

    csfCallbacks.onConfigSuccess(callbackObj);

    // If a recurring card
    if (csfState.numIframes === 1 && csfConfig.isCreditCardType) {
        if (csfState.type === 'card') {
            logger.error(
                "ERROR: Payment method with a single secured field - but 'brands' has not been set to an array containing the specific card brand"
            );
            return false;
        }

        // Get card object from txVariant
        const card: CardObject = cardType.getCardByBrand(csfState.type);

        // It's possible we don't recognise the card type -
        // scenario: frontend initially recognises card as e.g. Visa - but then backend tokenises it as a sub-brand which we currently don't recognise
        if (card) {
            // Assess whether cvc field is required
            const cvcPolicy = card.cvcPolicy ?? CVC_POLICY_REQUIRED;

            // If cvc is optional - the form can be considered valid
            if (cvcPolicy !== CVC_POLICY_REQUIRED) {
                validateForm();
            }
        }
    }
    return true;
}

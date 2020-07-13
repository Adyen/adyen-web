import { existy } from '../../utilities/commonUtils';
import cardType from '../../utilities/cardType';
import { CardObject, CbObjOnConfigSuccess } from '../../types';
import * as logger from '../../utilities/logger';

export function isConfigured(): void {
    this.state.isConfigured = true;

    const callbackObj: CbObjOnConfigSuccess = { iframesConfigured: true, type: this.state.type };

    this.callbacks.onConfigSuccess(callbackObj);

    // If a recurring card
    if (this.state.numIframes === 1 && this.config.isCreditCardType) {
        if (this.state.type === 'card') {
            logger.error("ERROR: Payment method with a single secured field - but 'type' has not been set to a specific card brand");
            return;
        }

        // Get card object from txVariant
        const card: CardObject = cardType.getCardByBrand(this.state.type);

        // It's possible we don't recognise the card type -
        // scenario: frontend initially recognises card as e.g. Visa - but then backend tokenises it as a sub-brand which we currently don't recognise
        if (card) {
            // Assess whether cvc field is required
            const cvcRequired = !(existy(card.cvcRequired) && !card.cvcRequired);

            // If cvc is optional - the form can be considered valid
            if (!cvcRequired) {
                this.assessFormValidity();
            }
        }
    }
}

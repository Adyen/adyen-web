import ua from '../../../utilities/userAgent';
import * as logger from '../../../utilities/logger';
import { shiftTabCreditCard } from './tabScenarioCreditCard';
import { shiftTabACH } from './tabScenarioACH';
import { shiftTabGiftCard } from './tabScenarioGiftCard';
import { shiftTabKCP } from './tabScenarioKCP';
import { ShiftTabObject } from '../../../types';

const logTab = false;

const focusExternalField = (pAdditionalField: HTMLElement): void => {
    if (pAdditionalField) {
        pAdditionalField.focus();

        // Quirky! - Needed to work in the Components scenario
        pAdditionalField.blur();
        pAdditionalField.focus();
    }
};

function handleShiftTab(fieldType: string): void {
    if (logTab) logger.log('### handleTab::handleShiftTab:: fieldType', fieldType);

    let shiftTabObj: ShiftTabObject;

    switch (this.state.type) {
        // ACH scenario: bankAccountNumber SF followed by a bankLocationId SF
        case 'ach':
            shiftTabObj = shiftTabACH(fieldType);
            break;

        // GIFT CARD scenario: SecurityCode preceded by CardNumber
        case 'giftcard':
            shiftTabObj = shiftTabGiftCard(fieldType, this.props.rootNode);
            break;

        // Credit Card scenarios
        default:
            // KCP scenario: Regular credit card but with additional fields
            // - an encrypted pin/password field preceded by a form field of a non-SF type (d.o.b/taxRefNum)
            if (this.state.isKCP) {
                shiftTabObj = shiftTabKCP(fieldType, this.props.rootNode, this.state.hasSeparateDateFields);
            } else {
                // Regular Credit Card
                shiftTabObj = shiftTabCreditCard(fieldType, this.props.rootNode, this.state.hasSeparateDateFields, this.state.numIframes);
            }
            break;
    }

    const fieldToFocus: string = shiftTabObj.fieldToFocus;
    const additionalField: HTMLElement = shiftTabObj.additionalField;

    if (fieldToFocus) {
        this.setFocusOnFrame(fieldToFocus, logTab);
    } else if (additionalField) {
        focusExternalField(additionalField);
    }
}

const eligibleForTabFix = (): boolean => ua.__IS_FIREFOX || (ua.__IS_IE && ua.__IS_IE <= 11);

function handleSFShiftTab(fieldType: string): void {
    if (eligibleForTabFix()) {
        this.handleShiftTab(fieldType);
    }
}

export default {
    handleShiftTab,
    handleSFShiftTab
};

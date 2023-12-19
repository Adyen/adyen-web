import ua from '../utils/userAgent';
import * as logger from '../../utilities/logger';
import { shiftTabCreditCard } from '../utils/tabbing/tabScenarioCreditCard';
import { shiftTabACH } from '../utils/tabbing/tabScenarioACH';
import { shiftTabGiftCard } from '../utils/tabbing/tabScenarioGiftCard';
import { shiftTabKCP } from '../utils/tabbing/tabScenarioKCP';
import { SFFieldType, ShiftTabObject } from '../../types';
import { focusExternalField } from '../utils/tabbing/utils';

const logTab = false;

function handleShiftTab(fieldType: SFFieldType): void {
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

function handleSFShiftTab(fieldType: SFFieldType): void {
    if (eligibleForTabFix()) {
        this.handleShiftTab(fieldType);
    }
}

export default {
    handleShiftTab,
    handleSFShiftTab
};

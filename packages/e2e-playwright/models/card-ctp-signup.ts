import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import LANG from '../../server/translations/en-US.json';
import { Card } from './card';
import { USER_TYPE_DELAY } from '../tests/utils/constants';

const CONSENT_CHECKBOX_LABEL = LANG['ctp.signup.consentLabel'].replace(/%#/g, '');
const DETAILS_GROUP_LABEL = LANG['ctp.signup.a11y.detailsGroup'];
const STORE_DETAILS_LABEL = LANG['storeDetails'];
const CLICK_TO_PAY_CARDS_TITLE = LANG['ctp.cards.title'];
const MANUAL_CARD_ENTRY_LABEL = LANG['ctp.manualCardEntry'];

type ClickToPaySignupFields = {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
    mobileNumber?: string;
};

/**
 * The parts of the Card payment data that Click to Pay sign-up controls.
 * Encrypted card fields are intentionally left out.
 */
type ClickToPaySignupPayload = {
    storeClickToPayProfile?: boolean;
    shopperName?: { firstName?: string; lastName?: string };
    shopperEmail?: string;
    telephoneNumber?: string;
};

class CardWithClickToPaySignup extends Card {
    /**
     * The sign-up renders next to the card fields, outside '.adyen-checkout__card-input', so locators are
     * scoped to the Storybook component root instead
     */
    readonly componentRoot: Locator;

    readonly signupConsentCheckbox: Locator;
    readonly signupDetailsGroup: Locator;
    readonly signupFirstNameInput: Locator;
    readonly signupLastNameInput: Locator;
    readonly signupEmailInput: Locator;
    readonly signupPhonePrefixInput: Locator;
    readonly signupMobileNumberInput: Locator;

    readonly storeDetailsCheckbox: Locator;

    readonly clickToPayCardsTitle: Locator;
    readonly manualCardEntryButton: Locator;

    constructor(page: Page) {
        super(page);

        this.componentRoot = this.page.locator(this.a11yComponentSelector());

        this.signupConsentCheckbox = this.componentRoot.getByRole('checkbox', { name: CONSENT_CHECKBOX_LABEL });
        this.signupDetailsGroup = this.componentRoot.getByRole('group', { name: DETAILS_GROUP_LABEL });
        this.signupFirstNameInput = this.signupDetailsGroup.getByRole('textbox', { name: LANG['firstName'] });
        this.signupLastNameInput = this.signupDetailsGroup.getByRole('textbox', { name: LANG['lastName'] });
        this.signupEmailInput = this.signupDetailsGroup.getByRole('textbox', { name: LANG['ctp.signup.emailLabel'] });
        this.signupPhonePrefixInput = this.signupDetailsGroup.getByRole('combobox', { name: /prefix/i });
        this.signupMobileNumberInput = this.signupDetailsGroup.getByRole('textbox', { name: LANG['ctp.signup.mobileLabel'] });

        this.storeDetailsCheckbox = this.componentRoot.getByRole('checkbox', { name: STORE_DETAILS_LABEL });

        this.clickToPayCardsTitle = this.componentRoot.getByText(CLICK_TO_PAY_CARDS_TITLE);
        this.manualCardEntryButton = this.componentRoot.getByRole('button', { name: MANUAL_CARD_ENTRY_LABEL });
    }

    /**
     * For a recognized shopper, Click to Pay renders first and the card fields stay hidden until manual entry is chosen.
     * Card.goto() can't be used here because it waits for the card fields.
     */
    async gotoAsRecognizedShopper(url: string) {
        await this.page.goto(url);
        await this.clickToPayCardsTitle.waitFor({ state: 'visible' });
    }

    async openManualCardEntry() {
        await this.manualCardEntryButton.click();
        await this.cardNumberInput.waitFor({ state: 'visible' });
    }

    /**
     * The checkbox label covers the native input and holds the "Click to Pay" info button,
     * so the consent is toggled with the keyboard, the same way a keyboard-only shopper does it
     */
    async checkSignupConsent() {
        await this.setSignupConsent(true);
    }

    async uncheckSignupConsent() {
        await this.setSignupConsent(false);
    }

    private async setSignupConsent(checked: boolean) {
        await expect(this.signupConsentCheckbox).toBeVisible();
        if ((await this.signupConsentCheckbox.isChecked()) !== checked) {
            await this.signupConsentCheckbox.press('Space');
        }
        await expect(this.signupConsentCheckbox).toBeChecked({ checked });
    }

    async fillSignupDetails({ firstName, lastName, shopperEmail, mobileNumber }: ClickToPaySignupFields) {
        if (firstName) await this.signupFirstNameInput.pressSequentially(firstName, { delay: USER_TYPE_DELAY });
        if (lastName) await this.signupLastNameInput.pressSequentially(lastName, { delay: USER_TYPE_DELAY });
        if (shopperEmail) await this.signupEmailInput.pressSequentially(shopperEmail, { delay: USER_TYPE_DELAY });
        if (mobileNumber) await this.signupMobileNumberInput.pressSequentially(mobileNumber, { delay: USER_TYPE_DELAY });
    }

    /**
     * Reads the payment data the Card would submit, through the Storybook window bridge, without submitting a payment
     */
    async getClickToPaySignupPayload(): Promise<ClickToPaySignupPayload> {
        await this.page.waitForFunction(() => Boolean(globalThis.component?.data?.paymentMethod));
        return this.page.evaluate(() => {
            const { paymentMethod, shopperName, shopperEmail, telephoneNumber } = globalThis.component.data;
            return {
                storeClickToPayProfile: paymentMethod.storeClickToPayProfile,
                shopperName,
                shopperEmail,
                telephoneNumber
            };
        });
    }
}

export { CardWithClickToPaySignup };

import { createRef, h } from 'preact';
import { act, render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import CardInput from './CardInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import getDataset from '../../../../core/Services/get-dataset';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import initCSF from '../../../internal/SecuredFields/lib/CSF';
import { ClickToPayContext, IClickToPayContext } from '../../../internal/ClickToPay/context/ClickToPayContext';
import { CtpState } from '../../../internal/ClickToPay/services/ClickToPayService';
import { InfoEventType, UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import type { CardInputProps, CardInputRef } from './types';
import type { BinLookupResponse } from '../../types';
import type { FastlaneSignupConfiguration } from '../../../PayPalFastlane/types';

jest.mock('../../../internal/SecuredFields/lib/CSF');
jest.mock('../../../../core/Services/get-dataset');

const createBrand = (brand: string, localeBrand: string) => ({
    brand,
    cvcPolicy: 'required',
    enableLuhnCheck: true,
    expiryDatePolicy: 'required',
    localeBrand,
    paymentMethodVariant: brand,
    showSocialSecurityNumber: false,
    supported: true
});

const MC_RESPONSE = { issuingCountryCode: 'US', supportedBrands: [createBrand('mc', 'MasterCard')] } as unknown as BinLookupResponse;
const VISA_RESPONSE = { issuingCountryCode: 'US', supportedBrands: [createBrand('visa', 'VISA')] } as unknown as BinLookupResponse;
const BCMC_AND_MC_RESPONSE = {
    issuingCountryCode: 'BE',
    supportedBrands: [createBrand('bcmc', 'Bancontact card'), createBrand('mc', 'MasterCard')]
} as unknown as BinLookupResponse;
const MC_AND_BCMC_RESPONSE = {
    issuingCountryCode: 'BE',
    supportedBrands: [createBrand('mc', 'MasterCard'), createBrand('bcmc', 'Bancontact card')]
} as unknown as BinLookupResponse;
const MC_AND_ACCEL_RESPONSE = {
    issuingCountryCode: 'US',
    supportedBrands: [createBrand('mc', 'MasterCard'), createBrand('accel', 'Accel')]
} as unknown as BinLookupResponse;
const ACCEL_AND_MC_RESPONSE = {
    issuingCountryCode: 'US',
    supportedBrands: [createBrand('accel', 'Accel'), createBrand('mc', 'MasterCard')]
} as unknown as BinLookupResponse;
const VISA_AND_ACCEL_RESPONSE = {
    issuingCountryCode: 'US',
    supportedBrands: [createBrand('visa', 'VISA'), createBrand('accel', 'Accel')]
} as unknown as BinLookupResponse;

const FASTLANE_CONFIGURATION: FastlaneSignupConfiguration = {
    showConsent: true,
    defaultToggleState: false,
    termsAndConditionsLink: 'https://adyen.com',
    termsAndConditionsVersion: 'v1',
    privacyPolicyLink: 'https://adyen.com',
    fastlaneSessionId: 'xxx-bbb'
};

type CardInputTestProps = Partial<CardInputProps> & { ctpState?: CtpState };

let cardInputRef: CardInputRef;
let onChange: jest.Mock;

const renderCardInput = ({ ctpState = CtpState.NotAvailable, ...props }: CardInputTestProps = {}) => {
    const core = setupCoreMock();
    onChange = jest.fn();

    const ui = (state: CtpState, extraProps: Partial<CardInputProps> = {}) => (
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            <AmountProvider amount={{ value: 1000, currency: 'USD' }} providerRef={createRef()}>
                <ClickToPayContext.Provider value={mock<IClickToPayContext>({ ctpState: state })}>
                    <CardInput
                        i18n={core.modules.i18n}
                        clientKey="xxxx"
                        loadingContext="test"
                        resources={core.modules.resources}
                        brandsIcons={[]}
                        brandsConfiguration={{}}
                        configuration={{}}
                        type="scheme"
                        onSubmitAnalytics={jest.fn()}
                        onChange={onChange}
                        setComponentRef={(ref: CardInputRef) => {
                            cardInputRef = ref;
                        }}
                        isClickToPaySignupAvailable={true}
                        {...props}
                        {...extraProps}
                    />
                </ClickToPayContext.Provider>
            </AmountProvider>
        </CoreProvider>
    );

    const view = render(ui(ctpState));
    return { ...view, rerenderWith: (state: CtpState, extraProps?: Partial<CardInputProps>) => view.rerender(ui(state, extraProps)) };
};

const processBinLookup = async (response: BinLookupResponse) => {
    await act(() => {
        cardInputRef.processBinLookupResponse?.(response, false);
    });
};

// An empty response is how a BIN lookup reset reaches CardInput
const resetBinLookup = () => processBinLookup({} as BinLookupResponse);

// Emits the brand detected by the regex inside the SecuredFields iframe, before or without a BIN lookup result
const detectBrandByRegex = async (brand: string) => {
    const [{ callbacks }] = (initCSF as jest.Mock).mock.calls.at(-1);
    await act(() => {
        callbacks.onBrand({ brand, cvcPolicy: 'required', expiryDatePolicy: 'required' });
    });
};

const querySignupCheckbox = () => screen.queryByRole('checkbox', { name: /Save my information with Click to Pay/ });
const getSignupCheckbox = () => screen.getByRole('checkbox', { name: /Save my information with Click to Pay/ });

const getLastClickToPaySignupState = () => {
    const calls = onChange.mock.calls.filter(([state]) => 'clickToPaySignup' in state);
    return calls.length ? calls[calls.length - 1][0].clickToPaySignup : undefined;
};

describe('CardInput - Click to Pay sign up', () => {
    beforeEach(() => {
        (getDataset as jest.Mock).mockResolvedValue([{ id: 'US', prefix: '+1' }]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('visibility', () => {
        test('should not show the sign up before a card brand is detected', () => {
            renderCardInput();
            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should show the sign up when Mastercard is detected', async () => {
            renderCardInput();
            await processBinLookup(MC_RESPONSE);

            expect(querySignupCheckbox()).toBeInTheDocument();
            expect(querySignupCheckbox()).not.toBeChecked();
        });

        test('should not show the sign up when a brand other than Mastercard is detected', async () => {
            renderCardInput();
            await processBinLookup(VISA_RESPONSE);

            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should hide the sign up when the detected brand is reset', async () => {
            renderCardInput();
            await processBinLookup(MC_RESPONSE);
            expect(querySignupCheckbox()).toBeInTheDocument();

            await resetBinLookup();
            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should not show the sign up when only the regex detects Mastercard', async () => {
            renderCardInput();
            await detectBrandByRegex('mc');

            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should hide the sign up when the BIN lookup resets, even if the regex still detects Mastercard', async () => {
            renderCardInput();
            await detectBrandByRegex('mc');
            await processBinLookup(MC_RESPONSE);
            expect(querySignupCheckbox()).toBeInTheDocument();

            await resetBinLookup();
            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test.each([
            ['Mastercard first', MC_AND_ACCEL_RESPONSE],
            ['the debit network first', ACCEL_AND_MC_RESPONSE]
        ])('should show the sign up for a Mastercard card co-branded with a US debit network (%s)', async (_, response) => {
            renderCardInput();
            await processBinLookup(response);

            expect(querySignupCheckbox()).toBeInTheDocument();
        });

        test('should not show the sign up for a Visa card co-branded with a US debit network', async () => {
            renderCardInput();
            await processBinLookup(VISA_AND_ACCEL_RESPONSE);

            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should hide the sign up when a co-branded Mastercard card is reset', async () => {
            renderCardInput();
            await processBinLookup(MC_AND_ACCEL_RESPONSE);
            expect(querySignupCheckbox()).toBeInTheDocument();

            await resetBinLookup();
            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should not show the sign up when it is not available for the merchant configuration', async () => {
            renderCardInput({ isClickToPaySignupAvailable: false });
            await processBinLookup(MC_RESPONSE);

            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test.each([CtpState.Ready, CtpState.ShopperIdentified, CtpState.OneTimePassword, CtpState.Login, CtpState.Loading])(
            'should not show the sign up for a Mastercard card when the Click to Pay state is %s',
            async ctpState => {
                renderCardInput({ ctpState });
                await processBinLookup(MC_RESPONSE);

                expect(querySignupCheckbox()).not.toBeInTheDocument();
            }
        );
    });

    describe('dual branded cards', () => {
        test('should not show the sign up while the other brand is selected', async () => {
            renderCardInput();
            await processBinLookup(BCMC_AND_MC_RESPONSE);

            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should show the sign up when Mastercard is the preselected brand', async () => {
            renderCardInput();
            await processBinLookup(MC_AND_BCMC_RESPONSE);

            expect(querySignupCheckbox()).toBeInTheDocument();
        });

        test('should show the sign up once Mastercard is selected, and hide it when the other brand is selected again', async () => {
            const user = userEvent.setup();
            renderCardInput();
            await processBinLookup(BCMC_AND_MC_RESPONSE);

            await user.click(screen.getByRole('button', { name: 'MasterCard' }));
            expect(querySignupCheckbox()).toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: 'Bancontact card' }));
            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });
    });

    describe('consent', () => {
        test('should emit the consent and details when the shopper checks the consent', async () => {
            const user = userEvent.setup();
            renderCardInput({ clickToPayConfiguration: { firstName: 'Jane', shopperEmail: 'jane@example.com' } });
            await processBinLookup(MC_RESPONSE);

            await user.click(getSignupCheckbox());

            await waitFor(() =>
                expect(getLastClickToPaySignupState()).toEqual({
                    consentGiven: true,
                    details: { firstName: 'Jane', shopperEmail: 'jane@example.com' }
                })
            );
        });

        test('should not give consent by default', async () => {
            renderCardInput();
            await processBinLookup(MC_RESPONSE);

            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: false })));
        });

        test('should reset the consent when Mastercard is no longer the active brand', async () => {
            const user = userEvent.setup();
            renderCardInput();
            await processBinLookup(MC_RESPONSE);
            await user.click(getSignupCheckbox());
            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: true })));

            await processBinLookup(VISA_RESPONSE);
            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: false })));

            await processBinLookup(MC_RESPONSE);
            expect(querySignupCheckbox()).not.toBeChecked();
        });

        test('should reset the consent when the shopper selects the other brand of a dual branded card', async () => {
            const user = userEvent.setup();
            renderCardInput();
            await processBinLookup(MC_AND_BCMC_RESPONSE);
            await user.click(getSignupCheckbox());
            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: true })));

            await user.click(screen.getByRole('button', { name: 'Bancontact card' }));
            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: false })));
        });

        test('should hide the sign up and reset the consent when the shopper becomes recognized by Click to Pay', async () => {
            const user = userEvent.setup();
            const { rerenderWith } = renderCardInput();
            await processBinLookup(MC_RESPONSE);
            await user.click(getSignupCheckbox());
            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: true })));

            rerenderWith(CtpState.Ready);

            await waitFor(() => expect(getLastClickToPaySignupState()).toEqual(expect.objectContaining({ consentGiven: false })));
            expect(querySignupCheckbox()).not.toBeInTheDocument();
        });

        test('should not emit sign up state when the sign up is not available', async () => {
            renderCardInput({ isClickToPaySignupAvailable: false });
            await processBinLookup(MC_RESPONSE);

            expect(getLastClickToPaySignupState()).toBeUndefined();
        });
    });

    describe('analytics', () => {
        const getDisplayedEvents = (onSubmitAnalytics: jest.Mock) =>
            onSubmitAnalytics.mock.calls.filter(
                ([event]) => event.type === InfoEventType.displayed && event.target === UiTarget.clickToPaySignupConsentToggle
            );

        test('should send a displayed event when the sign up is shown', async () => {
            const onSubmitAnalytics = jest.fn();
            renderCardInput({ onSubmitAnalytics });
            await processBinLookup(MC_RESPONSE);

            expect(getDisplayedEvents(onSubmitAnalytics)).toHaveLength(1);
            expect(onSubmitAnalytics).toHaveBeenCalledWith(
                expect.objectContaining({
                    component: 'scheme',
                    type: InfoEventType.displayed,
                    target: UiTarget.clickToPaySignupConsentToggle,
                    brand: 'mc'
                })
            );
        });

        test('should send one displayed event for each change from hidden to visible', async () => {
            const onSubmitAnalytics = jest.fn();
            renderCardInput({ onSubmitAnalytics });

            await processBinLookup(MC_RESPONSE);
            await processBinLookup(VISA_RESPONSE);
            await processBinLookup(MC_RESPONSE);

            expect(getDisplayedEvents(onSubmitAnalytics)).toHaveLength(2);
        });

        test('should not send another displayed event when re-rendered while visible', async () => {
            const onSubmitAnalytics = jest.fn();
            const { rerenderWith } = renderCardInput({ onSubmitAnalytics });
            await processBinLookup(MC_RESPONSE);

            rerenderWith(CtpState.NotAvailable, { onSubmitAnalytics });
            await processBinLookup(MC_RESPONSE);

            expect(getDisplayedEvents(onSubmitAnalytics)).toHaveLength(1);
        });

        test.each([
            ['a brand other than Mastercard is detected', {}, CtpState.NotAvailable, VISA_RESPONSE],
            ['the sign up is not available', { isClickToPaySignupAvailable: false }, CtpState.NotAvailable, MC_RESPONSE],
            ['the shopper is recognized by Click to Pay', {}, CtpState.Ready, MC_RESPONSE]
        ])('should not send sign up events while hidden because %s', async (_, props, ctpState, response) => {
            const onSubmitAnalytics = jest.fn();
            renderCardInput({ ...props, ctpState, onSubmitAnalytics });
            await processBinLookup(response);

            expect(onSubmitAnalytics).not.toHaveBeenCalledWith(expect.objectContaining({ target: UiTarget.clickToPaySignupConsentToggle }));
        });
    });

    describe('Fastlane priority', () => {
        test('should not render Fastlane sign up when Click to Pay sign up is available', async () => {
            renderCardInput({ fastlaneConfiguration: FASTLANE_CONFIGURATION });
            await processBinLookup(VISA_RESPONSE);

            expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ fastlaneData: expect.anything() }));
        });

        test('should render Fastlane sign up when Click to Pay sign up is not available', async () => {
            renderCardInput({ fastlaneConfiguration: FASTLANE_CONFIGURATION, isClickToPaySignupAvailable: false });

            await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fastlaneData: expect.anything() })));
        });
    });
});

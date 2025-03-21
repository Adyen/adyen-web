import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { PayByBankPixData, PayByBankPixConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import UIElement from '../internal/UIElement';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import RedirectButton from '../internal/RedirectButton';
import AdyenCheckoutError, { ERROR } from '../../core/Errors/AdyenCheckoutError';
import { PasskeyService } from './services/PasskeyService';
import { authorizeEnrollment } from './services/authorizeEnrollment';
import { authorizePayment } from './services/authorizePayment';
import Payment from './components/Payment';
import Enrollment from './components/Enrollment';
import { PaymentAction } from '../../types/global-types';
import type { ICore } from '../../core/types';

//todo: remove
const hasRedirectResult = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirectResult') != null;
};

class PayByBankPixElement extends UIElement<PayByBankPixConfiguration> {
    public static type = TxVariants.paybybank_pix;
    private static TIMEOUT_MINUTES = 1;
    private readonly passkeyService: PasskeyService;

    public static defaultProps: PayByBankPixConfiguration = {
        showPayButton: true,
        _isAdyenHosted: window.location.hostname.endsWith('adyen.com') || hasRedirectResult(), // todo: remove hasRedirectResult
        countdownTime: PayByBankPixElement.TIMEOUT_MINUTES
    };

    constructor(checkout: ICore, props?: PayByBankPixConfiguration) {
        super(checkout, props);
        this.passkeyService = new PasskeyService({ environment: this.props.environment, deviceId: this.props.deviceId });
    }

    get isValid(): boolean {
        // Always true for non-hosted page or stored payment
        if (!this.props._isAdyenHosted || this.props.storedPaymentMethodId) {
            return true;
        }
        return !!this.state?.isValid;
    }

    /**
     * Method used to let the merchant know if the shopper's device supports WebAuthn APIs: https://featuredetect.passkeys.dev/
     */
    public override async isAvailable(): Promise<void> {
        const unsupportedReason = await this.passkeyService.getWebAuthnUnsupportedReason();
        if (unsupportedReason) {
            // todo: send to analytics
            return Promise.reject(new AdyenCheckoutError(ERROR, unsupportedReason));
        }
        if (!this.props._isAdyenHosted) {
            return Promise.resolve();
        }

        try {
            await this.passkeyService.initialize();
            return Promise.resolve();
        } catch (error) {
            this.handleError(
                error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, 'Error initialize passkey service', { cause: error })
            );
            return Promise.reject();
        }
    }

    formatData(): PayByBankPixData {
        if (!this.props._isAdyenHosted) {
            return {
                paymentMethod: { type: TxVariants.paybybank_pix }
            };
        }

        const isEnrollment = this.props.storedPaymentMethodId == null;
        return {
            paymentMethod: { type: TxVariants.paybybank_pix, ...this.state.data },
            // Always store the payment method for the enrollment flow.
            ...(isEnrollment ? { storePaymentMethod: true } : {})
        };
    }

    /**
     * There are 3 endpoints (stages) we need to call for the enrollment flow.
     * The first one is the regular payments call on issuer selection - we indicate to store the payment token for the selected issuer.
     * The second one is to poll the enrollment eligibility - we poll the server to get the enrollment challenge in the `getEnrollmentStatus` function.
     * The third one is in the `authorizeEnrollment` function - we create passkeys and authorize the enrollment with shopper's passkey.
     */
    private readonly onIssuerSelected = async payload => {
        try {
            const { data = {} } = payload;
            if (!data.issuer) {
                return;
            }

            const { deviceId, ...riskSignals } = await this.passkeyService.captureRiskSignalsEnrollment();
            this.setState({ ...payload, data: { ...data, riskSignals, deviceId } });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onIssuerSelected';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    private readonly authorizeEnrollment = async (registrationOptions: string): Promise<void> => {
        try {
            const fidoAssertion = await this.passkeyService.createCredentialForEnrollment(registrationOptions); // Create passkey and trigger biometrics
            const enrollment = { enrollmentId: this.props.enrollmentId, fidoAssertion };
            const { action = {} } = await authorizeEnrollment({
                enrollment,
                clientKey: this.props.clientKey,
                loadingContext: this.props.loadingContext
            });
            // The action should redirect shopper back to the merchant's page
            this.handleAction(action as PaymentAction);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the authorizeEnrollment';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    /**
     * There are 3 endpoints (stages) we need to call for the payment flow.
     * The first one `payWithStoredPayment` is the regular payments call - we attempt to pay with the stored payment token.
     * The second one is to poll the authorization options - we poll the server to get the challenge in the `getAuthorizationStatus` function.
     * The third one is in the `authorizePayment` function - we authorize the payment with shopper's passkey.
     */
    private readonly payWithStoredPayment = () => {
        try {
            this.state = { ...this.state, ...{ data: { storedPaymentMethodId: this.props.storedPaymentMethodId } } };
            super.submit();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the payWithStoredPayment';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    private readonly authorizePayment = async (authenticationOptions: string): Promise<void> => {
        try {
            const riskSignals = await this.passkeyService.captureRiskSignalsAuthentication();
            const fidoAssertion = await this.passkeyService.authenticateWithCredential(authenticationOptions);
            const payment = { enrollmentId: this.props.enrollmentId, initiationId: this.props.initiationId, fidoAssertion, riskSignals };
            const { action = {} } = await authorizePayment({
                payment,
                clientKey: this.props.clientKey,
                loadingContext: this.props.loadingContext
            });
            // The action should redirect shopper back to the merchant's page
            this.handleAction(action as PaymentAction);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the authorizePayment';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    render() {
        // Always render the redirect button on the merchant's page
        if (!this.props._isAdyenHosted) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                    <SRPanelProvider srPanel={this.props.modules.srPanel}>
                        <RedirectButton
                            showPayButton={this.props.showPayButton}
                            name={this.displayName}
                            label={this.props.i18n.get('paybybankpix.redirectBtn.label')}
                            amount={this.props.amount}
                            payButton={this.payButton}
                            onSubmit={this.submit}
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                        />
                    </SRPanelProvider>
                </CoreProvider>
            );
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    {this.props.storedPaymentMethodId != null ? (
                        this.passkeyService.captureRiskSignalsAuthentication().then(() => (
                            // Render payment when the stored deviceId matches with the deviceId from the server
                            <Payment
                                txVariant={PayByBankPixElement.type}
                                type={this.props.type}
                                clientKey={this.props.clientKey}
                                amount={this.props.amount}
                                issuer={this.props.issuer}
                                receiver={this.props.receiver}
                                enrollmentId={this.props.enrollmentId}
                                initiationId={this.props.initiationId}
                                setComponentRef={this.setComponentRef}
                                onPay={this.payWithStoredPayment}
                                onAuthorize={this.authorizePayment}
                            />
                        ))
                    ) : (
                        <Enrollment
                            onError={this.handleError}
                            txVariant={PayByBankPixElement.type}
                            // Await
                            type={this.props.type}
                            clientKey={this.props.clientKey}
                            enrollmentId={this.props.enrollmentId}
                            countdownTime={this.props.countdownTime}
                            onEnroll={this.authorizeEnrollment}
                            // Issuer List
                            issuers={this.props.issuers}
                            payButton={this.payButton}
                            onChange={this.onIssuerSelected}
                            onSubmitAnalytics={this.submitAnalytics}
                            setComponentRef={this.setComponentRef}
                        />
                    )}
                </SRPanelProvider>
            </CoreProvider>
        );
    }
}
//
export default PayByBankPixElement;

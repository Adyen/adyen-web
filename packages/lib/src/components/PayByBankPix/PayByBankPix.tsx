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
import StoredPayment from './components/StoredPayment';
import Enrollment from './components/Enrollment';
import { PaymentAction } from '../../types/global-types';
import type { ICore } from '../../core/types';

const isAdyenHosted = () => {
    try {
        const currentUrl = new URL(window.location.href);
        return currentUrl.hostname.endsWith('.adyen.com');
    } catch (e) {
        // SSR, or it fails to parse the full url
        return false;
    }
};
class PayByBankPixElement extends UIElement<PayByBankPixConfiguration> {
    public static readonly type = TxVariants.paybybank_pix;
    private static readonly TIMEOUT_MINUTES = 1;
    private readonly passkeyService: PasskeyService;

    public static readonly defaultProps: PayByBankPixConfiguration = {
        showPayButton: true,
        _isAdyenHosted: isAdyenHosted(),
        countdownTime: PayByBankPixElement.TIMEOUT_MINUTES
    };

    constructor(checkout: ICore, props?: PayByBankPixConfiguration) {
        super(checkout, props);
        const deviceId = this.props.storedPaymentMethodId ? this.props?.payByBankPixDetails?.deviceId : this.props.deviceId;
        this.passkeyService = new PasskeyService({ environment: this.props.environment, deviceId });
        if (this.props._isAdyenHosted) {
            void this.passkeyService.initialize();
        }
    }

    get isValid(): boolean {
        // Always true for non-hosted page or stored payment
        if (!this.props._isAdyenHosted || this.props.storedPaymentMethodId) {
            return true;
        }
        return !!this.state?.isValid;
    }

    /**
     * Display in the drop-in
     */
    get additionalInfo() {
        return this.props.storedPaymentMethodId
            ? this.props.i18n.get('paybybankpix.storedPayment.additionalLabel', { values: { receiver: this.props?.payByBankPixDetails?.receiver } })
            : '';
    }

    /**
     * Display in the drop-in
     */
    public override get icon() {
        return this.props.storedPaymentMethodId
            ? this.resources.getImage({ parentFolder: `${PayByBankPixElement.type}/` })(this.props?.payByBankPixDetails?.ispb)
            : super.icon;
    }

    /**
     * Method used to let the merchant know if the shopper's device supports WebAuthn APIs: https://featuredetect.passkeys.dev/
     */
    public override async isAvailable(): Promise<void> {
        const unsupportedReason = await this.passkeyService.getWebAuthnUnsupportedReason();
        if (unsupportedReason) {
            return Promise.reject(new AdyenCheckoutError(ERROR, unsupportedReason));
        }
        if (!this.props._isAdyenHosted) {
            return Promise.resolve();
        }

        // Load passkey sdk on the hosted page
        try {
            await this.passkeyService.initialize();

            if (this.props.storedPaymentMethodId) {
                // If the provided deviceId from the server does not match the localstorage deviceId, do not render the stored payment component.
                const shouldShowStoredPaymentMethod = await this.passkeyService.canUseStoredCredential();
                return shouldShowStoredPaymentMethod ? Promise.resolve() : Promise.reject();
            }

            return Promise.resolve();
        } catch (error) {
            this.handleError(
                error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, 'Error initialize passkey service', { cause: error })
            );
            return Promise.reject(error instanceof Error ? error?.message : 'Unknown error');
        }
    }

    /**
     * Make sure the await action UIElement is available before mounting
     */
    public override handleAction(action: PaymentAction, props: {} = {}): UIElement | null {
        const paymentAction = this.core.createFromAction(action, {
            ...this.elementRef.props,
            ...props,
            onAdditionalDetails: this.handleAdditionalDetails
        });
        if (paymentAction) {
            this.unmount();
            void paymentAction.isAvailable().then(() => {
                paymentAction.mount(this._node);
            });
            return paymentAction;
        }

        return null;
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
            const enrollment = { enrollmentId: this.props.paymentMethodData?.enrollmentId, fidoAssertion };
            const { redirectResult } = await authorizeEnrollment({
                enrollment,
                clientKey: this.props.clientKey,
                loadingContext: this.props.loadingContext
            });
            // Make paymentDetails call to finalize the enrollment.
            this.handleAdditionalDetails({ data: { details: { redirectResult } } });
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
    private readonly payWithStoredPayment = async () => {
        try {
            const { deviceId, ...riskSignals } = await this.passkeyService.captureRiskSignalsAuthentication();
            this.state = { ...this.state, ...{ data: { storedPaymentMethodId: this.props.storedPaymentMethodId, riskSignals, deviceId } } };
            super.submit();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the payWithStoredPayment';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    private readonly authorizePayment = async (authenticationOptions: string): Promise<void> => {
        try {
            const fidoAssertion = await this.passkeyService.authenticateWithCredential(authenticationOptions);
            const payment = {
                enrollmentId: this.props.paymentMethodData?.enrollmentId,
                initiationId: this.props.paymentMethodData?.initiationId,
                fidoAssertion
            };
            const { redirectResult } = await authorizePayment({
                payment,
                clientKey: this.props.clientKey,
                loadingContext: this.props.loadingContext
            });
            this.handleAdditionalDetails({ data: { details: { redirectResult } } });
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
                        <StoredPayment
                            txVariant={PayByBankPixElement.type}
                            type={this.props.type}
                            clientKey={this.props.clientKey}
                            amount={this.props.amount}
                            issuer={this.props?.payByBankPixDetails?.ispb}
                            receiver={this.props?.payByBankPixDetails?.receiver}
                            enrollmentId={this.props.paymentMethodData?.enrollmentId}
                            initiationId={this.props.paymentMethodData?.initiationId}
                            setComponentRef={this.setComponentRef}
                            onPay={this.payWithStoredPayment}
                            onAuthorize={this.authorizePayment}
                        />
                    ) : (
                        <Enrollment
                            onError={this.handleError}
                            txVariant={PayByBankPixElement.type}
                            // Await
                            type={this.props.type}
                            clientKey={this.props.clientKey}
                            enrollmentId={this.props.paymentMethodData?.enrollmentId}
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

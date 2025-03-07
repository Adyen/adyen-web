import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { PayByBankPixData, PayByBankPixConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import UIElement from '../internal/UIElement';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import RedirectButton from '../internal/RedirectButton';
import AdyenCheckoutError, { ERROR } from '../../core/Errors/AdyenCheckoutError';
import { PasskeyService } from './services/PasskeyService';
import { postEnrollment } from './services/postEnrollment';
import { authenticatePayment } from './services/authenticatePayment';
import Payment from './components/Payment';
import Enrollment from './components/Enrollment';

//todo: remove
const hasRedirectResult = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirectResult') != null;
};

class PayByBankPixElement extends UIElement<PayByBankPixConfiguration> {
    public static type = TxVariants.paybybank_pix;
    private static TIMEOUT_MINUTES = 1;
    private passkeyService: PasskeyService;

    public static defaultProps: PayByBankPixConfiguration = {
        showPayButton: true,
        _isAdyenHosted: window.location.hostname.endsWith('adyen.com') || hasRedirectResult(), // todo: remove hasRedirectResult
        countdownTime: PayByBankPixElement.TIMEOUT_MINUTES
    };

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
        const unsupportedReason = await PasskeyService.getWebAuthnUnsupportedReason();
        if (unsupportedReason) {
            // todo: send to analytics
            return Promise.reject(new AdyenCheckoutError('ERROR', unsupportedReason));
        }
        if (!this.props._isAdyenHosted) {
            return Promise.resolve();
        }
        try {
            this.passkeyService = await new PasskeyService({ environment: this.props.environment, deviceId: this.props.deviceId }).initialize();
            return Promise.resolve();
        } catch (error) {
            this.handleError(
                error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError('ERROR', 'Error in the postEnrollment call', { cause: error })
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

        return {
            paymentMethod: { type: TxVariants.paybybank_pix, ...this.state.data }
        };
    }

    private onIssuerSelected = async payload => {
        try {
            const { data = {} } = payload;
            if (data.issuer == null) {
                return;
            }
            const riskSignals = await this.passkeyService.captureRiskSignalsEnrollment();
            this.setState({ ...payload, data: { ...data, riskSignals } });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onIssuerSelected';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    private onEnroll = async (registrationOptions: string): Promise<void> => {
        try {
            const fidoAssertion = await this.passkeyService.createCredentialForEnrollment(registrationOptions); // Create passkey and trigger biometrics
            const enrollment = { enrollmentId: this.props.enrollmentId, fidoAssertion };
            const { action = {} } = await postEnrollment({ enrollment, clientKey: this.props.clientKey, loadingContext: this.props.loadingContext });
            // The action should redirect shopper back to the merchant's page
            // @ts-ignore todo: fix types later
            this.handleAction(action);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onEnroll';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    private payWithStoredPayment = async (): Promise<void> => {
        try {
            const riskSignals = await this.passkeyService.captureRiskSignalsAuthentication();
            this.setState({ data: { riskSignals, storedPaymentMethodId: this.props.storedPaymentMethodId } });
            super.submit();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onPay';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    private onAuthenticate = async (authenticationOptions: string): Promise<void> => {
        try {
            const authCredentials = await this.passkeyService.authenticateWithCredential(authenticationOptions);
            const { action = {} } = await authenticatePayment({
                authCredentials,
                clientKey: this.props.clientKey,
                loadingContext: this.props.loadingContext
            });
            // The action should redirect shopper back to the merchant's page
            // @ts-ignore todo: fix types later
            this.handleAction(action);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error in the onAuthenticate';
            this.handleError(error instanceof AdyenCheckoutError ? error : new AdyenCheckoutError(ERROR, errorMsg));
        }
    };

    render() {
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
                        <Payment
                            txVariant={PayByBankPixElement.type}
                            clientKey={this.props.clientKey}
                            amount={this.props.amount}
                            issuer={this.props.issuer}
                            receiver={this.props.receiver}
                            paymentMethod={this.props.paymentMethod}
                            paymentDate={this.props.paymentDate}
                            setComponentRef={this.setComponentRef}
                            onPay={this.payWithStoredPayment}
                            onAuthenticate={this.onAuthenticate}
                        />
                    ) : (
                        <Enrollment
                            onError={this.handleError}
                            // Await
                            type={this.props.type}
                            clientKey={this.props.clientKey}
                            enrollmentId={this.props.enrollmentId}
                            paymentMethodType={this.props.paymentMethodType}
                            countdownTime={this.props.countdownTime}
                            onEnroll={this.onEnroll}
                            // Issuer List
                            txVariant={PayByBankPixElement.type}
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

import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { PayByBankPixData, PayByBankPixConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import UIElement from '../internal/UIElement';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import RedirectButton from '../internal/RedirectButton';
import PayByBankPix from './components/PayByBankPix';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { PasskeyService } from './services/PasskeyService';
import { postEnrollment } from './services/postEnrollment';

//todo: remove
const hasRedirectResult = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirectResult') != null;
};

class PayByBankPixElement extends UIElement<PayByBankPixConfiguration> {
    public static type = TxVariants.paybybank_pix;
    private static TIMEOUT_MINUTES = 1;

    public static defaultProps: PayByBankPixConfiguration = {
        showPayButton: true,
        _isAdyenHosted: window.location.hostname.endsWith('adyen.link') || hasRedirectResult(), // todo: remove hasRedirectResult
        countdownTime: PayByBankPixElement.TIMEOUT_MINUTES
    };

    get isValid(): boolean {
        // Always true for redirect
        return this.props._isAdyenHosted ? !!this.state?.isValid : true;
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
        return Promise.resolve();
    }

    formatData(): PayByBankPixData {
        if (!this.props._isAdyenHosted) {
            return {
                paymentMethod: { type: TxVariants.paybybank_pix }
            };
        }

        const issuer = this.state.data?.issuer ? { issuer: this.state.data?.issuer } : {};
        const riskSignals = this.state.data?.riskSignals ? { riskSignals: this.state.data.riskSignals } : {};
        return {
            paymentMethod: { type: TxVariants.paybybank_pix, ...issuer, ...riskSignals }
        };
    }

    async createEnrollment({ enrollment }) {
        const { action = {} } = await postEnrollment(enrollment);
        // The action should redirect shopper back to the merchant's page
        this.handleAction(action);
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    {this.props._isAdyenHosted ? (
                        <PayByBankPix
                            {...this.props}
                            txVariant={PayByBankPixElement.type}
                            payButton={this.payButton}
                            onChange={this.setState}
                            setComponentRef={this.setComponentRef}
                            onSubmitAnalytics={this.submitAnalytics}
                            onEnrollment={this.createEnrollment}
                            onError={this.handleError}
                        />
                    ) : (
                        <RedirectButton
                            showPayButton={this.props.showPayButton}
                            name={this.displayName}
                            amount={this.props.amount}
                            payButton={this.payButton}
                            onSubmit={this.submit}
                            ref={ref => {
                                this.componentRef = ref;
                            }}
                        />
                    )}
                </SRPanelProvider>
            </CoreProvider>
        );
    }
}
//
export default PayByBankPixElement;

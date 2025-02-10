import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { PayByBankPixData, PayByBankPixConfiguration } from './types';
import { TxVariants } from '../tx-variants';
import UIElement from '../internal/UIElement';
import SRPanelProvider from '../../core/Errors/SRPanelProvider';
import type { ICore } from '../../core/types';
import PasskeyService from './services/PasskeyService';
import RedirectButton from '../internal/RedirectButton';
import PayByBankPix from './components/PayByBankPix';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

class PayByBankPixElement extends UIElement<PayByBankPixConfiguration> {
    private passkeyService: PasskeyService;

    public static type = TxVariants.paybybank_pix;
    private static TIMEOUT_MINUTES = 1;

    public static defaultProps: PayByBankPixConfiguration = {
        showPayButton: true,
        issuers: [{ id: 'issuerId_123', name: 'issuer 123' }],
        _isNativeFlow: window.location.hostname.endsWith('.adyen.com') || window.location.hostname.endsWith('localhost'),
        countdownTime: PayByBankPixElement.TIMEOUT_MINUTES
    };

    constructor(checkout: ICore, props: PayByBankPixConfiguration) {
        super(checkout, props);

        // todo: Load passkey sdk, check if we should only load the sdk in a hosted environment
        //this.passkeyService = new PasskeyService({ environment: 'test', clientId: this.props.clientKey });
    }

    get isValid(): boolean {
        // Always true for redirect (non-native flow)
        return this.props._isNativeFlow ? !!this.state?.isValid : true;
    }

    formatProps(props): PayByBankPixConfiguration {
        return {
            ...super.formatProps(props)
        };
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
        // on the merchant page, we need to send both device id and riskSignals
        // enrich risk signals only on hosted page
        // on the hosted checkout page, we reuse the same id and riskSignals. We get them from the query params / pbl logic, and pass them through to the second /payments call
        const issuer = this.state.data?.issuer ? { issuer: this.state.data?.issuer } : {};
        const subType = this.props._isNativeFlow ? 'embedded' : 'redirect';
        return {
            paymentMethod: { type: TxVariants.paybybank_pix, subType, ...issuer },
            // todo: remove this and put it in the payments call
            returnUrl: this.props._isNativeFlow
                ? 'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--simulate-hosted-page&viewMode=story'
                : 'https://localhost:3020/iframe.html?args=&globals=&id=components-paybybankpix--merchant-page&viewMode=story'
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    {this.props._isNativeFlow ? (
                        <PayByBankPix
                            {...this.props}
                            txVariant={PayByBankPixElement.type}
                            payButton={this.payButton}
                            onChange={this.setState}
                            setComponentRef={this.setComponentRef}
                            onSubmitAnalytics={this.submitAnalytics}
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

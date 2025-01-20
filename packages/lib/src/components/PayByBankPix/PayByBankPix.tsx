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

    public static defaultProps: PayByBankPixConfiguration = {
        issuers: [{ id: '123', name: 'issuer 123' }],
        _isNativeFlow: window.location.hostname.endsWith('.adyen.com') || window.location.hostname.endsWith('localhost')
    };

    constructor(checkout: ICore, props: PayByBankPixConfiguration) {
        super(checkout, props);
        if (this.props._isNativeFlow) {
            // todo: Load passkey sdk only for adyen hosted page or localhost
            //this.passkeyService = new PasskeyService({ environment: 'test', clientId: this.props.clientKey });
        }
    }

    get isValid(): boolean {
        return true; //todo
    }

    formatProps(props): PayByBankPixConfiguration {
        return {
            ...super.formatProps(props)
        };
    }

    /**
     * Method used to let the merchant know if the shopper's device supports WebAuthn APIs
     */
    public override async isAvailable(): Promise<void> {
        const unsupportedReason = await PasskeyService.getWebAuthnUnsupportedReason();
        if (unsupportedReason) {
            return Promise.reject(new AdyenCheckoutError('ERROR', unsupportedReason));
        }
        return Promise.resolve();
    }

    formatData(): PayByBankPixData {
        const issuer = this.state.data?.issuer ? { issuer: this.state.data?.issuer } : {};
        const subType = this.props._isNativeFlow ? 'embedded' : 'redirect';
        return { paymentMethod: { type: TxVariants.paybybank_pix, subType, ...issuer } };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <SRPanelProvider srPanel={this.props.modules.srPanel}>
                    {this.props._isNativeFlow ? (
                        // @ts-ignore bla
                        <PayByBankPix
                            {...this.props}
                            payButton={this.payButton}
                            onSubmit={this.submit}
                            onChange={this.setState}
                            setComponentRef={this.setComponentRef}
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

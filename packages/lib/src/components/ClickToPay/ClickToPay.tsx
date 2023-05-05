import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { ClickToPayElementProps, ClickToPayPaymentData } from './types';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../Card/components/ClickToPay/services/types';
import { createClickToPayService } from '../Card/components/ClickToPay/services/create-clicktopay-service';
import { ClickToPayConfiguration } from '../Card/types';
import ClickToPayProvider from '../Card/components/ClickToPay/context/ClickToPayProvider';
import ClickToPayComponent from '../Card/components/ClickToPay';
import { CtpState } from '../Card/components/ClickToPay/services/ClickToPayService';
import collectBrowserInfo from '../../utils/browserInfo';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

export class ClickToPayElement extends UIElement<ClickToPayElementProps> {
    public static type = 'clicktopay';

    private readonly clickToPayService: IClickToPayService | null;
    private readonly ctpConfiguration: ClickToPayConfiguration;

    constructor(props) {
        super(props);

        this.ctpConfiguration = {
            shopperEmail: this.props.shopperEmail,
            telephoneNumber: this.props.telephoneNumber,
            merchantDisplayName: this.props.merchantDisplayName,
            locale: this.props.locale
        };

        this.clickToPayService = createClickToPayService(this.props.configuration, this.ctpConfiguration, this.props.environment);
        this.clickToPayService?.initialize();
    }

    get isValid() {
        return true;
    }

    get browserInfo() {
        return collectBrowserInfo();
    }

    public submit(): void {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', 'Calling submit() is not supported for this payment method'));
    }

    public formatData(): ClickToPayPaymentData {
        const { srcScheme, srcCorrelationId, srcTokenReference, srcCheckoutPayload, srcDigitalCardId } = this.state.data;
        return {
            paymentMethod: {
                type: ClickToPayElement.type,
                ...(srcScheme && { srcScheme }),
                ...(srcCorrelationId && { srcCorrelationId }),
                ...(srcTokenReference && { srcTokenReference }),
                ...(srcCheckoutPayload && { srcCheckoutPayload }),
                ...(srcDigitalCardId && { srcDigitalCardId })
            },
            browserInfo: this.browserInfo,
            origin: !!window && window.location.origin
        };
    }

    protected formatProps(props: ClickToPayElementProps) {
        return {
            ...props,
            disableOtpAutoFocus: props.disableOtpAutoFocus || false,
            shopperEmail: props.shopperEmail || props?._parentInstance?.options?.session?.shopperEmail,
            telephoneNumber: props.telephoneNumber || props?._parentInstance?.options?.session?.telephoneNumber,
            locale: props.locale || props.i18n?.locale?.replace('-', '_')
        };
    }

    /**
     * Method used to let the merchant know if the shopper have a valid CtP accoubt
     *
     * Resolves Promise if the Shopper has cookies OR has valid CtP account
     * Rejects Promise if account isn't found or if Login screen is triggered
     */
    public async isAvailable(): Promise<boolean> {
        if (this.clickToPayService.shopperAccountFound) {
            return Promise.resolve(true);
        }

        return new Promise((resolve, reject) => {
            this.clickToPayService.subscribeOnStateChange((state: CtpState) => {
                if (this.clickToPayService.shopperAccountFound) resolve(true);
                if (state === CtpState.NotAvailable || state === CtpState.Login || state === CtpState.Idle) reject(false);
            });
        });
    }

    private handleClickToPaySubmit = (payload: ClickToPayCheckoutPayload) => {
        this.setState({ data: { ...payload }, valid: {}, errors: {}, isValid: true });
        this.submit();
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <ClickToPayProvider
                    isStandaloneComponent={true}
                    configuration={this.ctpConfiguration}
                    amount={this.props.amount}
                    clickToPayService={this.clickToPayService}
                    setClickToPayRef={this.setComponentRef}
                    onSetStatus={this.setElementStatus}
                    onSubmit={this.handleClickToPaySubmit}
                    onError={this.handleError}
                >
                    <ClickToPayComponent />
                </ClickToPayProvider>
            </CoreProvider>
        );
    }
}

export default ClickToPayElement;

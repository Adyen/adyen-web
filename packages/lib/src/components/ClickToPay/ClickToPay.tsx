import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { ClickToPayElementProps } from './types';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../Card/components/ClickToPay/services/types';
import { createClickToPayService } from '../Card/components/ClickToPay/services/create-clicktopay-service';
import { ClickToPayConfiguration } from '../Card/types';
import ClickToPayProvider from '../Card/components/ClickToPay/context/ClickToPayProvider';
import ClickToPayComponent from '../Card/components/ClickToPay';

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

    protected formatProps(props: ClickToPayElementProps) {
        return {
            ...props,
            disableOtpAutoFocus: props.disableOtpAutoFocus || false,
            shopperEmail: props.shopperEmail || props?._parentInstance?.options?.session?.shopperEmail,
            telephoneNumber: props.telephoneNumber || props?._parentInstance?.options?.session?.telephoneNumber,
            locale: props.locale || props.i18n?.locale?.replace('-', '_')
        };
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
                    // setClickToPayRef={setClickToPayRef}
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

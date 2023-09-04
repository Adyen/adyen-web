import { h } from 'preact';
import UIElement from '../UIElement';
import DragonpayInput from './components/DragonpayInput';
import DragonpayVoucherResult from './components/DragonpayVoucherResult';
import CoreProvider from '../../core/Context/CoreProvider';
import { DragonpayElementProps } from './types';
import { TxVariants } from '../tx-variants';

export class DragonpayElement extends UIElement<DragonpayElementProps> {
    public static type = TxVariants.dragonpay;

    public static txVariants = [
        TxVariants.dragonpay_ebanking,
        TxVariants.dragonpay_otc_banking,
        TxVariants.dragonpay_otc_non_banking,
        TxVariants.dragonpay_otc_philippines
    ];

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        const { issuer, shopperEmail } = this.state.data;

        return {
            ...(shopperEmail && { shopperEmail }),
            paymentMethod: {
                ...(issuer && { issuer }),
                type: this.props.type || DragonpayElement.type
            }
        };
    }

    protected formatProps(props: DragonpayElementProps) {
        return {
            ...props,
            issuers: props.details?.find(detail => detail.key === 'issuer')?.items ?? props.issuers
        };
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                {this.props.reference ? (
                    <DragonpayVoucherResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        icon={this.icon}
                        {...this.props}
                    />
                ) : (
                    <DragonpayInput
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        items={this.props.issuers}
                        {...this.props}
                        onChange={this.setState}
                        onSubmit={this.submit}
                        payButton={this.payButton}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default DragonpayElement;

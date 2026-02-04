import { h } from 'preact';
import { ICore, UIElement } from '../../types';
import { TxVariants } from '../tx-variants';
import { EMIConfiguration, EMIFundingSource } from './types';
import CardElement from '../Card';
import UPIElement from '../UPI';
import { EMIComponent } from './EMIComponent';

export class EMI extends UIElement<EMIConfiguration> {
    public static readonly type = TxVariants.emi;

    private readonly fundingSourceUIElements: Record<EMIFundingSource, CardElement | UPIElement>;

    public activeFundingSource: EMIFundingSource;

    constructor(checkout: ICore, props: EMIConfiguration) {
        super(checkout, props);

        this.activeFundingSource = EMIFundingSource.CARD;

        const cardElement = new CardElement(checkout, {
            ...props?.fundingSourceConfiguration?.card,
            showPayButton: false
        });

        const upiElement = new UPIElement(checkout, {
            ...props?.fundingSourceConfiguration?.upi,
            defaultMode: 'qrCode',
            showPayButton: false
        });

        this.fundingSourceUIElements = {
            [EMIFundingSource.CARD]: cardElement,
            [EMIFundingSource.UPI]: upiElement
        };
    }

    private setActiveFundingSource(fundingSource: EMIFundingSource) {
        this.activeFundingSource = fundingSource;
    }

    get card(): CardElement {
        return this.fundingSourceUIElements.card as CardElement;
    }

    get upi(): UPIElement {
        return this.fundingSourceUIElements.upi as UPIElement;
    }

    get isValid(): boolean {
        return this.fundingSourceUIElements[this.activeFundingSource].isValid;
    }

    // @ts-ignore
    formatData() {
        return {
            ...this.fundingSourceUIElements[this.activeFundingSource].formatData()
            // paymentMethod: {
            //     type: this.type
            // }
        };
    }

    public override submit(): void {
        const activeElement = this.fundingSourceUIElements[this.activeFundingSource];

        if (!this.isValid) {
            activeElement.showValidation();
            return;
        }

        super.submit();
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <EMIComponent
                defaultActiveFundingSource={this.activeFundingSource}
                fundingSourceUIElements={this.fundingSourceUIElements}
                onSetActiveFundingSource={this.setActiveFundingSource.bind(this)}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton.bind(this)}
            />
        );
    }
}

export default EMI;

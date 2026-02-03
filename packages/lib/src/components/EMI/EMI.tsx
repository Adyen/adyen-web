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

        this.fundingSourceUIElements = {
            [EMIFundingSource.CARD]: new CardElement(checkout, {
                elementRef: this.elementRef,
                ...props?.fundingSourceConfiguration?.card,
                isDropin: props.isDropin
            }),
            [EMIFundingSource.UPI]: new UPIElement(checkout, {
                elementRef: this.elementRef,
                ...props?.fundingSourceConfiguration?.upi,
                defaultMode: 'qrCode',
                isDropin: props.isDropin
            })
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

    // @ts-ignore
    formatData() {
        return {
            ...this.fundingSourceUIElements[this.activeFundingSource].formatData()
        };
    }

    get isValid() {
        return this.fundingSourceUIElements[this.activeFundingSource].isValid;
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <EMIComponent
                defaultActiveFundingSource={this.activeFundingSource}
                fundingSourceUIElements={this.fundingSourceUIElements}
                onSetActiveFundingSource={this.setActiveFundingSource.bind(this)}
            />
        );
    }
}

export default EMI;

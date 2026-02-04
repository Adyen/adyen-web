import { h } from 'preact';
import { ICore, UIElement } from '../../types';
import { TxVariants } from '../tx-variants';
import { EMIConfiguration, EMIFundingSource, EMIOfferFormData } from './types';
import CardElement from '../Card';
import UPIElement from '../UPI';
import { EMIComponent } from './EMIComponent';

import type { UIElementStatus } from '../internal/UIElement/types';

export class EMI extends UIElement<EMIConfiguration> {
    public static readonly type = TxVariants.emi;

    private readonly fundingSourceUIElements: Record<EMIFundingSource, CardElement | UPIElement>;

    private activeFundingSource: EMIFundingSource;

    constructor(checkout: ICore, props: EMIConfiguration) {
        super(checkout, props);

        this.activeFundingSource = EMIFundingSource.CARD;

        const cardElement = new CardElement(checkout, {
            ...props?.fundingSourceConfiguration?.card,
            elementRef: this.elementRef,
            showPayButton: false
        });

        const upiElement = new UPIElement(checkout, {
            ...props?.fundingSourceConfiguration?.upi,
            elementRef: this.elementRef,
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

    private setOfferFormState(data: EMIOfferFormData) {
        this.setState({ offerFormData: data });
    }

    get card(): CardElement {
        return this.fundingSourceUIElements.card as CardElement;
    }

    get upi(): UPIElement {
        return this.fundingSourceUIElements.upi as UPIElement;
    }

    get isValid(): boolean {
        const offerFormData = this.state.offerFormData as EMIOfferFormData;
        const isOfferFormValid = !!offerFormData?.provider && !!offerFormData?.discount && !!offerFormData?.plan;
        return isOfferFormValid && this.fundingSourceUIElements[this.activeFundingSource].isValid;
    }

    // @ts-ignore
    formatData() {
        console.log('emi formatData');
        return {
            ...this.fundingSourceUIElements[this.activeFundingSource].formatData(),
            emiOfferForm: this.state.offerFormData
        };
    }

    public override showValidation(): this {
        super.showValidation();
        this.fundingSourceUIElements[this.activeFundingSource].showValidation();
        return this;
    }

    public override setStatus(status: UIElementStatus, props?): this {
        super.setStatus(status, props);
        this.fundingSourceUIElements[this.activeFundingSource].setStatus(status, props);
        return this;
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <EMIComponent
                defaultActiveFundingSource={this.activeFundingSource}
                fundingSourceUIElements={this.fundingSourceUIElements}
                onSetActiveFundingSource={this.setActiveFundingSource.bind(this)}
                onSetOfferFormState={this.setOfferFormState.bind(this)}
                setComponentRef={this.setComponentRef}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton.bind(this)}
            />
        );
    }
}

export default EMI;

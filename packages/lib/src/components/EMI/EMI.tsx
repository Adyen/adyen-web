import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CardElement from '../Card';
import { EMIComponent } from './EMIComponent';
import { TxVariants } from '../tx-variants';
import type { ICore } from '../../core/types';
import type { UIElementStatus } from '../internal/UIElement/types';
import { EMIConfiguration, EMIFundingSource } from './types';
import { SUPPORTED_FUNDING_SOURCES } from './constants';

class EMI extends UIElement<EMIConfiguration> {
    public static readonly type = TxVariants.emi;

    private readonly fundingSourceUIElements: Partial<Record<EMIFundingSource, UIElement>> = {};
    private activeFundingSource: EMIFundingSource | null = null;

    constructor(checkout: ICore, props?: EMIConfiguration) {
        super(checkout, props);
        if (this.validateFundingSources()) {
            this.initFundingSources();
        } else {
            console.warn('EMI: Component initialization aborted due to invalid or missing funding sources.');
        }
    }

    private validateFundingSources(): boolean {
        if (!this.props.supportedPaymentMethods?.length) return false;

        return this.props.supportedPaymentMethods.every(method => SUPPORTED_FUNDING_SOURCES[method.type] !== undefined);
    }

    private initFundingSources(): void {
        const firstMethod = this.props.supportedPaymentMethods?.[0];
        if (!firstMethod) return;

        this.activeFundingSource = SUPPORTED_FUNDING_SOURCES[firstMethod.type];

        this.fundingSourceUIElements[EMIFundingSource.CARD] = new CardElement(this.core, {
            ...this.props.fundingSourceConfiguration?.card,
            modules: this.props.modules,
            i18n: this.props.i18n,
            _disableClickToPay: true,
            showPayButton: false,
            elementRef: this.elementRef
        });
    }

    public get card(): CardElement | undefined {
        return this.fundingSourceUIElements[EMIFundingSource.CARD] as CardElement | undefined;
    }

    public override get additionalInfo(): string {
        return this.props.i18n?.get('emi.subtitle') ?? '';
    }

    private get activeFundingSourceElement(): UIElement | undefined {
        return this.activeFundingSource ? this.fundingSourceUIElements[this.activeFundingSource] : undefined;
    }

    public get isValid(): boolean {
        return this.activeFundingSourceElement?.isValid ?? false;
    }

    public formatData() {
        if (!this.activeFundingSourceElement) return {};
        // @ts-expect-error - protected cross-instance access; EMI owns these child elements
        return this.activeFundingSourceElement.formatData();
    }

    public override showValidation(): this {
        super.showValidation();
        this.activeFundingSourceElement?.showValidation();
        return this;
    }

    public override setStatus(status: UIElementStatus, props?: Record<string, unknown>): this {
        super.setStatus(status, props);
        this.activeFundingSourceElement?.setStatus(status, props);
        return this;
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <EMIComponent
                activeFundingSourceElement={this.activeFundingSourceElement ?? null}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton}
                setComponentRef={this.setComponentRef}
            />
        );
    }
}

export default EMI;

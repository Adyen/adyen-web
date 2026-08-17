import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CardElement from '../Card';
import { EMIComponent } from './EMIComponent';
import { TxVariants } from '../tx-variants';
import { resolvePlanIssuers } from './utils';
import type { ICore } from '../../core/types';
import type { UIElementStatus } from '../internal/UIElement/types';
import { EMIConfiguration, EMIFundingSource } from './types';
import type { EmiIssuer, EmiSelection } from './types';
import { SUPPORTED_FUNDING_SOURCES } from './constants';

class EMI extends UIElement<EMIConfiguration> {
    public static readonly type = TxVariants.emi;

    private readonly fundingSourceUIElements: Partial<Record<EMIFundingSource, EMIFundingSourceElement>> = {};
    private activeFundingSource: EMIFundingSource | null = null;

    /**
     * The issuers of the plans response, as they arrived. Read once here rather than per render, so
     * `isAvailable()` always answers from the same list the view renders.
     */
    private readonly issuers: EmiIssuer[];

    constructor(checkout: ICore, props?: EMIConfiguration) {
        super(checkout, props);

        this.issuers = resolvePlanIssuers(this.props.plans);

        this.initFundingSources();

        if (!this.activeFundingSource) {
            const types = this.props.supportedPaymentMethods?.map(m => m.type).join(', ') || 'none';
            console.warn(
                `EMI: No valid funding sources found. Received types: [${types}]. Supported types: [${Object.keys(SUPPORTED_FUNDING_SOURCES).join(', ')}].`
            );
        }

        if (!this.hasPlansAvailable) {
            console.warn(
                'EMI: No installment plans available. Pass the Checkout API /paymentMethods/emi/plans response through the `plans` configuration.'
            );
        }
    }

    private get hasPlansAvailable(): boolean {
        return this.issuers.length > 0 || !!this.props.session;
    }

    private initFundingSources(): void {
        const firstMethod = this.props.supportedPaymentMethods?.find(m => SUPPORTED_FUNDING_SOURCES[m.type] !== undefined);
        if (!firstMethod) return;

        this.activeFundingSource = SUPPORTED_FUNDING_SOURCES[firstMethod.type];

        this.fundingSourceUIElements[EMIFundingSource.CARD] = new CardElement(this.core, {
            ...this.props.fundingSourceConfiguration?.card,
            modules: this.props.modules,
            i18n: this.props.i18n,
            _disableClickToPay: true,
            showPayButton: false,
            elementRef: this.elementRef,
            onChange: () => this.onChange()
        });
    }

    public get card(): CardElement | undefined {
        return this.fundingSourceUIElements[EMIFundingSource.CARD];
    }

    public override get additionalInfo(): string {
        return this.props.i18n?.get('emi.subtitle') ?? '';
    }

    private get activeFundingSourceElement(): EMIFundingSourceElement | undefined {
        return this.activeFundingSource ? this.fundingSourceUIElements[this.activeFundingSource] : undefined;
    }

    public override isAvailable(): Promise<void> {
        if (!this.activeFundingSource) return Promise.reject(new Error('EMI: No valid funding sources available'));
        if (!this.hasPlansAvailable) return Promise.reject(new Error('EMI: No installment plans available'));

        return Promise.resolve();
    }

    public get isValid(): boolean {
        return this.activeFundingSourceElement?.isValid ?? false;
    }

    public formatData(): EMIFundingSourceData | Record<string, never> {
        if (!this.activeFundingSourceElement) return {};
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

    private readonly onPlanSelect = (emiSelection: EmiSelection): void => {
        this.setState({ emiSelection });
    };

    protected override componentToRender(): h.JSX.Element | null {
        if (!this.hasPlansAvailable) return null;

        return (
            <EMIComponent
                activeFundingSourceElement={this.activeFundingSourceElement ?? null}
                issuers={this.issuers}
                onPlanSelect={this.onPlanSelect}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton}
                setComponentRef={this.setComponentRef}
            />
        );
    }
}

export default EMI;

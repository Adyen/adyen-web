import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CardElement from '../Card';
import { EMIComponent } from './EMIComponent';
import { TxVariants } from '../tx-variants';
import { buildEmiPlanPayload, resolvePlanIssuers, selectDisplayOffer } from './utils';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { AnalyticsErrorEvent, ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';
import type { ICore } from '../../core/types';
import type { UIElementStatus } from '../internal/UIElement/types';
import { EMIConfiguration, EMIFundingSource } from './types';
import type { EmiIssuer, EmiSelection, EmiSelectTarget, EMIFundingSourceElement, EMIFundingSourceElements } from './types';
import { SUPPORTED_FUNDING_SOURCES } from './constants';

class EMI extends UIElement<EMIConfiguration> {
    public static readonly type = TxVariants.emi;

    private readonly fundingSourceUIElements: Partial<EMIFundingSourceElements> = {};
    private activeFundingSource: EMIFundingSource | null = null;

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

        if (this.props.plans && !Array.isArray(this.props.plans.issuers)) {
            this.reportError(
                ErrorEventCode.EMI_MALFORMED_PLANS_RESPONSE,
                'EMI: the `plans` configuration was provided but carries no `issuers` array'
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
        if (!this.activeFundingSource) {
            return this.rejectAsUnavailable(ErrorEventCode.EMI_NO_SUPPORTED_FUNDING_SOURCE, 'EMI: No valid funding sources available');
        }

        if (!this.hasPlansAvailable) {
            return this.rejectAsUnavailable(ErrorEventCode.EMI_NO_INSTALLMENT_PLANS, 'EMI: No installment plans available');
        }

        return Promise.resolve();
    }

    private rejectAsUnavailable(code: ErrorEventCode, message: string): Promise<void> {
        this.reportError(code, message);
        return Promise.reject(new Error(message));
    }

    private reportError(code: ErrorEventCode, message: string): void {
        const event = new AnalyticsErrorEvent({
            component: this.type,
            errorType: ErrorEventType.implementation,
            code,
            message
        });

        this.submitAnalytics(event);
    }

    public get isValid(): boolean {
        return this.activeFundingSourceElement?.isValid ?? false;
    }

    private get emiSelection(): EmiSelection | undefined {
        return this.state.emiSelection;
    }

    public formatData() {
        if (!this.activeFundingSourceElement) return {};

        const selection = this.emiSelection;

        return {
            ...this.activeFundingSourceElement.formatData(),
            ...(selection && { emiPlan: buildEmiPlanPayload(selection.issuer, selection.plan) })
        };
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

    protected override beforeRender(configSetByMerchant?: EMIConfiguration): void {
        if (configSetByMerchant?.originalAction) {
            return;
        }

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.rendered,
            component: this.type,
            configData: {
                showPayButton: this.props.showPayButton,
                fundingSource: this.activeFundingSource ?? 'none',
                issuerCount: this.issuers.length,
                planCount: this.issuers.reduce((total, issuer) => total + (issuer.plans?.length ?? 0), 0)
            }
        });

        this.submitAnalytics(event);
    }

    private readonly onPlanSelect = (emiSelection: EmiSelection, target?: EmiSelectTarget): void => {
        this.setState({ emiSelection });
        if (target) {
            const event = new AnalyticsInfoEvent({
                component: this.type,
                type: InfoEventType.selected,
                target,
                issuer: emiSelection.issuer.issuerCode
            });
            this.submitAnalytics(event);
        }
        this.reportDiscountBanner(emiSelection);
    };

    private reportDiscountBanner(emiSelection: EmiSelection): void {
        if (!this.activeFundingSourceElement || !selectDisplayOffer(emiSelection.plan.offers)) return;
        const event = new AnalyticsInfoEvent({
            component: this.type,
            type: InfoEventType.displayed,
            target: UiTarget.emiDiscountBanner,
            issuer: emiSelection.issuer.issuerCode
        });
        this.submitAnalytics(event);
    }

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

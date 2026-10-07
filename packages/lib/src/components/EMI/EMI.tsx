import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CardElement from '../Card';
import { EMIComponent } from './EMIComponent';
import { TxVariants } from '../tx-variants';
import { buildEmiPlanPayload, classifyEmiPlansError } from './utils';
import { getEmiPlans } from './services/getEmiPlans';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { AnalyticsErrorEvent, ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';
import type { ICore } from '../../core/types';
import type { UIElementStatus } from '../internal/UIElement/types';
import { EMIConfiguration, EMISupportedPaymentMethod } from './types';
import type {
    EmiIssuer,
    EmiPaymentMethodEntry,
    EMIPaymentData,
    EmiPlansOutcome,
    EmiSelection,
    EmiSelectTarget,
    EMISupportedPaymentMethodElement,
    EMISupportedPaymentMethodElements
} from './types';
import { EMI_NO_INSTALLMENT_PLANS, EMI_PLANS_TIMEOUT_MS, SUPPORTED_PAYMENT_METHODS } from './constants';

class EMI extends UIElement<EMIConfiguration> {
    public static readonly type = TxVariants.emi;

    private readonly supportedPaymentMethodElements: Partial<EMISupportedPaymentMethodElements> = {};
    private activeSupportedPaymentMethod: EMISupportedPaymentMethod | null = null;

    /** Set once the lookup settles, so a later render, such as re-opening the Drop-in tile, starts from it. */
    private plansOutcome?: EmiPlansOutcome;
    private plansPromise?: Promise<EmiPlansOutcome>;

    constructor(checkout: ICore, props?: EMIConfiguration) {
        super(checkout, props);

        this.initSupportedPaymentMethods();
    }

    /**
     * Read from the response rather than from `this.props`: merchant props are spread over the response entry,
     * so a merchant-passed `supportedPaymentMethods` would otherwise silently win over the backend's.
     */
    private get paymentMethodEntry(): EmiPaymentMethodEntry | undefined {
        return this.getPaymentMethodFromPaymentMethodsResponse(EMI.type, this.props.paymentMethodId);
    }

    private initSupportedPaymentMethods(): void {
        const firstMethod = this.paymentMethodEntry?.supportedPaymentMethods?.find(m => SUPPORTED_PAYMENT_METHODS[m.type] !== undefined);
        if (!firstMethod) return;

        this.activeSupportedPaymentMethod = SUPPORTED_PAYMENT_METHODS[firstMethod.type];

        this.supportedPaymentMethodElements[EMISupportedPaymentMethod.CARD] = new CardElement(this.core, {
            // The brands of the entry EMI matched, rather than those of whichever `scheme` the response happens to list first
            ...(firstMethod.brands && { brands: firstMethod.brands }),
            ...this.props.supportedPaymentMethodsConfiguration?.card,
            fundingSource: undefined,
            modules: this.props.modules,
            i18n: this.props.i18n,
            _disableClickToPay: true,
            showPayButton: false,
            elementRef: this.elementRef,
            onChange: () => this.onChange()
        });
    }

    public get card(): CardElement | undefined {
        return this.supportedPaymentMethodElements[EMISupportedPaymentMethod.CARD];
    }

    public override get additionalInfo(): string {
        return this.props.i18n?.get('emi.subtitle') ?? '';
    }

    private get activeSupportedPaymentMethodElement(): EMISupportedPaymentMethodElement | undefined {
        return this.activeSupportedPaymentMethod ? this.supportedPaymentMethodElements[this.activeSupportedPaymentMethod] : undefined;
    }

    /** Configuration only. The plans load when the component renders, so a Drop-in shopper who never opens EMI fetches none. */
    public override isAvailable(): Promise<void> {
        if (!this.activeSupportedPaymentMethod) {
            return this.rejectAsUnavailable(ErrorEventCode.EMI_NO_SUPPORTED_PAYMENT_METHOD, 'EMI: No valid supported payment methods available');
        }

        return Promise.resolve();
    }

    private rejectAsUnavailable(code: ErrorEventCode, message: string): Promise<void> {
        this.trackError(ErrorEventType.implementation, code, message);
        return Promise.reject(new AdyenCheckoutError('ERROR', message));
    }

    private trackError(errorType: ErrorEventType, code: ErrorEventCode, message: string): void {
        const event = new AnalyticsErrorEvent({
            component: this.type,
            errorType,
            code,
            message
        });

        this.submitAnalytics(event);
    }

    /** Memoized, and never rejects: a failure resolves as `unavailable`, and its analytics are sent exactly once. */
    private readonly loadPlans = (): Promise<EmiPlansOutcome> => {
        this.plansPromise ??= this.requestPlans().then(outcome => (this.plansOutcome = outcome));
        return this.plansPromise;
    };

    private async requestPlans(): Promise<EmiPlansOutcome> {
        // Sent even without a token: the backend rejects it, and keeps a trace of the misconfiguration
        const emiToken = this.paymentMethodEntry?.configuration?.emiToken;

        try {
            const response = await getEmiPlans({
                emiToken,
                clientKey: this.props.clientKey,
                loadingContext: this.props.loadingContext,
                timeout: EMI_PLANS_TIMEOUT_MS
            });
            const { issuers } = response;

            return issuers.length ? { status: 'ready', issuers } : this.noPlans();
        } catch (error) {
            // Fixed message only: the token and the backend's error body never reach analytics
            this.trackError(ErrorEventType.network, classifyEmiPlansError(error), 'EMI: Installment plans request failed');
            return { status: 'unavailable' };
        }
    }

    /** The backend answered with an empty issuers list. */
    private noPlans(): EmiPlansOutcome {
        const event = new AnalyticsInfoEvent({
            component: this.type,
            type: InfoEventType.validationError,
            validationErrorCode: EMI_NO_INSTALLMENT_PLANS,
            validationErrorMessage: 'EMI: No installment plans available'
        });
        this.submitAnalytics(event);

        return { status: 'unavailable' };
    }

    private get issuers(): EmiIssuer[] {
        return this.plansOutcome?.status === 'ready' ? this.plansOutcome.issuers : [];
    }

    /** Without a selection the payment request would carry no `emiPlan`, so a custom pay button cannot submit before the plans load. */
    public get isValid(): boolean {
        return !!this.emiSelection && (this.activeSupportedPaymentMethodElement?.isValid ?? false);
    }

    private get emiSelection(): EmiSelection | undefined {
        return this.state.emiSelection;
    }

    public formatData(): EMIPaymentData {
        if (!this.activeSupportedPaymentMethodElement) return { paymentMethod: { type: EMI.type } };

        const selection = this.emiSelection;

        return {
            ...this.activeSupportedPaymentMethodElement.formatData(),
            ...(selection && { emiPlan: buildEmiPlanPayload(selection.issuer, selection.plan) })
        };
    }

    public override showValidation(): this {
        super.showValidation();
        this.activeSupportedPaymentMethodElement?.showValidation();
        return this;
    }

    public override setStatus(status: UIElementStatus): this {
        super.setStatus(status);
        this.activeSupportedPaymentMethodElement?.setStatus(status);
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
                fundingSource: this.activeSupportedPaymentMethod ?? 'none'
            }
        });

        this.submitAnalytics(event);
    }

    private readonly onPlanSelect = (emiSelection: EmiSelection, target?: EmiSelectTarget): void => {
        this.setState({ emiSelection });
        this.trackSelection(emiSelection, target);
        this.trackDiscountBanner(emiSelection);
    };

    private trackSelection(emiSelection: EmiSelection, target?: EmiSelectTarget): void {
        if (!target) {
            this.trackSelectDisplayed(
                UiTarget.emiProvider,
                this.issuers.map(issuer => issuer.issuerCode),
                emiSelection.issuer.issuerCode
            );
            this.trackPlansDisplayed(emiSelection);
            return;
        }

        const event = new AnalyticsInfoEvent({
            component: this.type,
            type: InfoEventType.selected,
            target,
            selectedValue: target === UiTarget.emiPlan ? String(emiSelection.plan.tenureMonths) : emiSelection.issuer.issuerCode,
            issuer: emiSelection.issuer.issuerCode
        });
        this.submitAnalytics(event);

        if (target === UiTarget.emiProvider) {
            this.trackPlansDisplayed(emiSelection);
        }
    }

    private trackPlansDisplayed({ issuer, plan }: EmiSelection): void {
        this.trackSelectDisplayed(
            UiTarget.emiPlan,
            issuer.plans.map(candidate => String(candidate.tenureMonths)),
            String(plan.tenureMonths)
        );
    }

    private trackSelectDisplayed(target: EmiSelectTarget, presentedValues: string[], selectedValue: string): void {
        const event = new AnalyticsInfoEvent({
            component: this.type,
            type: InfoEventType.displayed,
            target,
            presentedValues,
            selectedValue
        });
        this.submitAnalytics(event);
    }

    private trackDiscountBanner(emiSelection: EmiSelection): void {
        if (!this.activeSupportedPaymentMethodElement || !emiSelection.plan.transactionAmounts.totalInstantDiscountAmount) return;
        const event = new AnalyticsInfoEvent({
            component: this.type,
            type: InfoEventType.displayed,
            target: UiTarget.emiDiscountBanner,
            issuer: emiSelection.issuer.issuerCode
        });
        this.submitAnalytics(event);
    }

    protected override componentToRender(): h.JSX.Element | null {
        const element = this.activeSupportedPaymentMethodElement;
        if (!element) return null;

        return (
            <EMIComponent
                activeSupportedPaymentMethodElement={element}
                loadPlans={this.loadPlans}
                initialOutcome={this.plansOutcome}
                onPlanSelect={this.onPlanSelect}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton}
                setComponentRef={this.setComponentRef}
            />
        );
    }
}

export default EMI;

import { h } from 'preact';
import UIElement from '../internal/UIElement';
import CardElement from '../Card';
import { EMIComponent } from './EMIComponent';
import { TxVariants } from '../tx-variants';
import { buildEmiPlanPayload, classifyEmiPlansError, describeEmiPlansError } from './utils';
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
    EmiPlansState,
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

    private plans?: EmiPlansState;
    private plansPromise?: Promise<EmiPlansState>;

    constructor(checkout: ICore, props?: EMIConfiguration) {
        super(checkout, props);

        this.initSupportedPaymentMethods();
    }

    private get paymentMethodEntry(): EmiPaymentMethodEntry | undefined {
        return this.getPaymentMethodFromPaymentMethodsResponse(EMI.type, this.props.paymentMethodId);
    }

    private initSupportedPaymentMethods(): void {
        const firstMethod = this.paymentMethodEntry?.supportedPaymentMethods?.find(m => SUPPORTED_PAYMENT_METHODS[m.type] !== undefined);
        if (!firstMethod) return;

        this.activeSupportedPaymentMethod = SUPPORTED_PAYMENT_METHODS[firstMethod.type];

        this.supportedPaymentMethodElements[EMISupportedPaymentMethod.CARD] = new CardElement(this.core, {
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

    private readonly loadPlans = (): Promise<EmiPlansState> => {
        this.plansPromise ??= this.requestPlans().then(plans => (this.plans = plans));
        return this.plansPromise;
    };

    private async requestPlans(): Promise<EmiPlansState> {
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
            this.trackError(ErrorEventType.network, classifyEmiPlansError(error), describeEmiPlansError(error));
            return { status: 'unavailable' };
        }
    }

    private noPlans(): EmiPlansState {
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
        return this.plans?.status === 'ready' ? this.plans.issuers : [];
    }

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
                initialPlans={this.plans}
                onPlanSelect={this.onPlanSelect}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton}
                setComponentRef={this.setComponentRef}
            />
        );
    }
}

export default EMI;

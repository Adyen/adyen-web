import { createRef, h, RefObject } from 'preact';
import { Resources } from '../../../core/Context/Resources';
import AdyenCheckoutError, { NETWORK_ERROR } from '../../../core/Errors/AdyenCheckoutError';
import { hasOwnProperty } from '../../../utils/hasOwnProperty';
import BaseElement from '../BaseElement/BaseElement';
import PayButton from '../PayButton';
import { assertIsDropin, cleanupFinalResult, getRegulatoryDefaults, sanitizeResponse, verifyPaymentDidNotFail } from './utils';

import { AbstractAnalyticsEvent } from '../../../core/Analytics/events/AbstractAnalyticsEvent';
import { AnalyticsErrorEvent, ErrorEventType } from '../../../core/Analytics/events/AnalyticsErrorEvent';
import { AnalyticsInfoEvent, InfoEventType } from '../../../core/Analytics/events/AnalyticsInfoEvent';
import { AnalyticsLogEvent, LogEventType } from '../../../core/Analytics/events/AnalyticsLogEvent';
import type {
    CheckoutSessionDetailsResponse,
    CheckoutSessionDonationCampaignsResponse,
    CheckoutSessionDonationsRequestData,
    CheckoutSessionDonationsResponse,
    CheckoutSessionPaymentResponse
} from '../../../core/CheckoutSession/types';
import type { NewableComponent } from '../../../core/core.registry';
import CancelError from '../../../core/Errors/CancelError';
import type { AdditionalDetailsData, CoreConfiguration, ICore } from '../../../core/types';
import type {
    ActionHandledReturnObject,
    CheckoutAdvancedFlowResponse,
    Order,
    PaymentAction,
    PaymentAmount,
    PaymentData,
    PaymentMethodsResponse,
    PaymentResponseData,
    RawPaymentMethod
} from '../../../types/global-types';
import type { IDropin } from '../../Dropin/types';
import type { ComponentMethodsRef, UIElementProps, UIElementStatus } from './types';
import type { IAnalytics } from '../../../core/Analytics/Analytics';

import { CoreProvider } from '../../../core/Context/CoreProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import './UIElement.scss';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { AmountProvider, AmountProviderRef } from '../../../core/Context/AmountProvider';
import { PayButtonProps } from '../PayButton/PayButton';
import { TxVariants } from '../../tx-variants';
import type { DonationConfiguration } from '../../Donation/types';
import type { DonationCampaign, DonationPayload } from '../../Donation/components/types';
import type { Donation } from '../../index';
import { getDonationComponent, normalizeDonationCampaign } from '../../Donation/components/utils';
import { DonationCampaignProvider } from '../../Donation/DonationCampaignProvider';

export abstract class UIElement<P extends UIElementProps = UIElementProps> extends BaseElement<P> {
    /**
     * componentRef is a ref to the primary component inside the subclass that extends UIElement e.g. CardInput.tsx (which sits inside Card.tsx)
     */
    protected componentRef: any;

    protected resources: Resources;

    /**
     * elementRef is a ref to the subclass that extends UIElement e.g. Card.tsx or Dropin.tsx
     */
    public elementRef: UIElement;

    public static type = undefined;

    /**
     * Reference to the methods exposed by the AmountProvider context
     */
    protected amountProviderRef: RefObject<AmountProviderRef> = createRef();

    /**
     * Defines all txVariants that the Component supports (in case it support multiple ones besides the 'type' one)
     */
    public static txVariants: string[] = [];

    constructor(checkout: ICore, props?: P) {
        super(checkout, props);

        this.core.register(this.constructor as NewableComponent);

        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.handleAction = this.handleAction.bind(this);
        this.handleOrder = this.handleOrder.bind(this);
        this.handleAdditionalDetails = this.handleAdditionalDetails.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.setElementStatus = this.setElementStatus.bind(this);
        this.submitAnalytics = this.submitAnalytics.bind(this);
        this.makePaymentsCall = this.makePaymentsCall.bind(this);
        this.makeAdditionalDetailsCall = this.makeAdditionalDetailsCall.bind(this);
        this.submitUsingSessionsFlow = this.submitUsingSessionsFlow.bind(this);
        this.updateAmount = this.updateAmount.bind(this);
        this.handleDonation = this.handleDonation.bind(this);

        this.elementRef = (props && props.elementRef) || this;
        this.resources = this.props.modules ? this.props.modules.resources : undefined;

        this.storeElementRefOnCore(this.props);

        this.onEnterKeyPressed = this.onEnterKeyPressed.bind(this);
        this.onActionHandled = this.onActionHandled.bind(this);

        this.createBeforeRenderHook(props);
        this.reportIntegrationFlavor();
    }

    /**
     * Creates a hook tied to render() method. This hook is called every time render() is invoked.
     * Currently useful for Analytics
     *
     * @param configSetByMerchant
     * @private
     */
    private createBeforeRenderHook(configSetByMerchant: P): void {
        const originalRender = this.render;

        this.render = (...args: any[]) => {
            this.beforeRender(configSetByMerchant);
            return originalRender.apply(this, args);
        };
    }

    protected beforeRender(configSetByMerchant?: P): void {
        // We don't send 'rendered' events when rendering actions
        if (configSetByMerchant?.originalAction) {
            return;
        }

        const event = new AnalyticsInfoEvent({
            type: InfoEventType.rendered,
            component: this.type,
            configData: { ...configSetByMerchant, showPayButton: this.props.showPayButton },
            ...(configSetByMerchant?.oneClick && { isStoredPaymentMethod: true })
        });

        this.analytics.sendAnalytics(event);
    }

    protected reportIntegrationFlavor(): void {
        void this.analytics.sendFlavor('components');
    }

    get analytics(): IAnalytics {
        return this.core.modules.analytics;
    }

    get srPanel(): SRPanel {
        return this.core.modules.srPanel;
    }

    private getPaymentMethodConfigFromResponse(componentProps: P) {
        if (componentProps?.storedPaymentMethodId) return this.getStoredPaymentMethodDetails(componentProps.storedPaymentMethodId);
        return this.getPaymentMethodFromPaymentMethodsResponse(componentProps?.type, componentProps?.paymentMethodId);
    }

    protected override buildElementProps(componentProps?: P) {
        const globalCoreProps = this.core.getCorePropsForComponent();

        const paymentMethodFromResponse = this.getPaymentMethodConfigFromResponse(componentProps);

        const finalProps = {
            showPayButton: true,
            ...globalCoreProps,
            ...paymentMethodFromResponse,
            ...componentProps
        };

        const isDropinInstance = assertIsDropin(this as unknown as IDropin);

        this.props = this.formatProps({
            ...this.constructor['defaultProps'], // component defaults
            ...getRegulatoryDefaults(this.core.options.countryCode, isDropinInstance), // regulatory defaults
            ...finalProps // the rest (inc. merchant defined config)
        });
    }

    protected getStoredPaymentMethodDetails(storedPaymentMethodId: string) {
        return this.core.paymentMethodsResponse.findStoredPaymentMethod(storedPaymentMethodId);
    }

    /**
     *  Get the payment method from the paymentMethodsResponse
     *
     * @param type - The type of the payment method to get. (This prop is passed by Drop-in OR Standalone components containing the property 'type' as part of their configuration)
     * @param paymentMethodId - Unique internal payment method ID
     */
    protected getPaymentMethodFromPaymentMethodsResponse(type?: string, paymentMethodId?: string): RawPaymentMethod {
        if (paymentMethodId) return this.core.paymentMethodsResponse.findById(paymentMethodId);
        return this.core.paymentMethodsResponse?.find(type || this.constructor['type']);
    }

    protected storeElementRefOnCore(props?: P) {
        if (!props?.isDropin) {
            this.core.storeElementReference(this);
        }
    }

    public isAvailable(): Promise<void> {
        return Promise.resolve();
    }

    public setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }

    public showValidation(): this {
        if (this.componentRef && this.componentRef.showValidation) this.componentRef.showValidation();
        return this;
    }

    /**
     * Updates the amount in the props and propagates it to the AmountProvider.
     * This allows children components to access the updated amount via context.
     *
     * @param amount - Primary payment amount object
     * @param secondaryAmount - Optional secondary amount for display purposes (e.g., converted currency)
     * @internal
     */
    public updateAmount(amount: PaymentAmount, secondaryAmount?: PaymentAmount): void {
        this.props = {
            ...this.props,
            ...(amount && { amount }),
            ...(secondaryAmount && { secondaryAmount })
        };
        this.amountProviderRef.current?.update(amount, secondaryAmount);
    }

    /**
     * Set status using elementRef, which:
     * - If Drop-in, will set status for Dropin component, and then it will propagate the new status for the active payment method component
     * - If Component, it will set its own status
     */
    public setElementStatus(status: UIElementStatus, props?: any): this {
        this.elementRef?.setStatus(status, props);
        return this;
    }

    /**
     * componentRef is a ref to the primary component inside that subclass e.g. CardInput.tsx
     */
    public setStatus(status: UIElementStatus, props?): this {
        if (this.componentRef?.setStatus) {
            this.componentRef.setStatus(status, props);
        }
        return this;
    }

    protected onChange(): void {
        this.props.onChange?.(
            {
                data: this.data,
                isValid: this.isValid,
                errors: this.state.errors,
                valid: this.state.valid
            },
            this.elementRef
        );
    }

    protected override submitAnalytics(event: AbstractAnalyticsEvent) {
        this.analytics.sendAnalytics(event);
    }

    public submit(): void {
        if (!this.isValid) {
            this.showValidation();
            return;
        }

        this.makePaymentsCall()
            .then(sanitizeResponse)
            .then(verifyPaymentDidNotFail)
            .then(this.handleResponse)
            .catch((e: PaymentResponseData | Error) => {
                if (e instanceof CancelError) {
                    this.setElementStatus('ready');
                    return;
                }
                this.handleFailedResult(e as PaymentResponseData);
            });
    }

    protected makePaymentsCall(): Promise<CheckoutAdvancedFlowResponse | CheckoutSessionPaymentResponse> {
        this.setElementStatus('loading');

        if (this.props.onSubmit) {
            return this.submitUsingAdvancedFlow();
        }

        if (this.core.session) {
            const beforeSubmitEvent: Promise<PaymentData> = this.props.beforeSubmit
                ? new Promise((resolve, reject) => {
                      void this.props.beforeSubmit(this.data, this.elementRef, {
                          resolve,
                          reject: () => reject(new CancelError('beforeSubmitRejected'))
                      });
                  })
                : Promise.resolve(this.data);

            return beforeSubmitEvent.then(this.submitUsingSessionsFlow);
        }

        this.handleError(
            new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'It can not perform /payments call. Callback "onSubmit" is missing or Checkout session is not available'
            )
        );
    }

    private async submitUsingAdvancedFlow(): Promise<CheckoutAdvancedFlowResponse> {
        const event = new AnalyticsLogEvent({
            component: this.type,
            type: LogEventType.submit,
            message: 'Shopper clicked pay'
        });
        this.submitAnalytics(event);

        return new Promise<CheckoutAdvancedFlowResponse>((resolve, reject) => {
            this.props.onSubmit(
                {
                    data: this.data,
                    isValid: this.isValid
                },
                this.elementRef,
                { resolve, reject }
            );
        });
    }

    private async submitUsingSessionsFlow(data: PaymentData): Promise<CheckoutSessionPaymentResponse> {
        const event = new AnalyticsLogEvent({
            component: this.type,
            type: LogEventType.submit,
            message: 'Shopper clicked pay'
        });
        this.submitAnalytics(event);

        try {
            return await this.core.session.submitPayment(data);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) {
                this.handleError(error);
            } else {
                this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /payments call', { cause: error }));
            }

            return Promise.reject(error);
        }

        // // Uncomment to simulate failed
        // return {
        //     resultCode: 'Refused',
        //     sessionData:
        //         'Ab02b4c0!BQABAgBKGgqfEz8uQlU4yCIOWjA8bkEwmbJ7Qt4r+x5IPXREu1rMjwNk5MDoHFNlv+MWvinS6nXIDniXgRzXCdSC4ksw9CNDBAjOa+B88wRoj/rLTieuWh/0leR88qkV24vtIkjsIsbJTDB78Pd8wX8MEDsXhaAdEIyX9E8eqxuQ3bwPbvLs1Dlgo1ZrfkQRzaNiuVM8ejRG0IWE1bGThJzY+sJvZZHvlDMXIlxhZcDoQvsMj/WwE6+nFJxBiC3oRzmvVn3AbkLQGtvwq16UUSfYbPzG9dXypJMtcrZAQYq2g/2+BSibCcmee9AXq/wij11BERrYmjbDt5NkkdUnDVgAB7pdqbnWX0A2sxBKeYtLSP2kxp+5LoU/Wty3fmcVA3VKVkHfgmIihkeL8lY++5hvHjnkzOE4tyx/sheiKS4zqoWE43TD6n8mpFskAzwMHq4G2o6vkXqvaKFEq7y/R2fVrCypenmRhkPASizpM265rKLU+L4E/C+LMHfN0LYKRMCrLr0gI2GAp+1PZLHgh0tCtiJC/zcJJtJs6sHNQxLUN+kxJuELUHOcuL3ivjG+mWteUnBENZu7KqOSZYetiWYRiyLOXDiBHqbxuQwTuO54L15VLkS/mYB20etibM1nn+fRmbo+1IJkCSalhwi5D7fSrpjbQTmAsOpJT1N8lC1MSNmAvAwG1kWL4JxYwXDKYyYASnsia2V5IjoiQUYwQUFBMTAzQ0E1MzdFQUVEODdDMjRERDUzOTA5QjgwQTc4QTkyM0UzODIzRDY4REFDQzk0QjlGRjgzMDVEQyJ98uZI4thGveOByYbomCeeP2Gy2rzs99FOBoDYVeWIUjyM+gfnW89DdJZAhxe74Tv0TnL5DRQYPCTRQPOoLbQ21NaeSho70FNE+n8XYKlVK5Ore6BoB6IVCaal5MkM27VmZPMmGflgcPx+pakx+EmRsYGdvYNImYxJYrRk3CI+l3T3ZiVpPPqebaVSLaSkEfu0iOFPjjLUhWN6QW6c18heE5vq/pcoeBf7p0Jgr9I5aBFY0avYG57BDGHzU1ZiQ9LLMTis2BA7Ap9pdNq8FVXL4fnoVHNZiiANOf3uvSknPKBID8sdOXUStA0crmO322FYjDqh1n6FG+D7+OJSayNsXIz6Zoy0eFn4HbT8nt8L2X2tdzkMayCYHXRwKh13Xyleqxt4WoEZmhwTmB3p9d1F0SylWnjcC6o/DnshJ9mMW/8D3oWS30Z7BwRODqKGVahRD0YGRzwMbVnEe5JFRfNvJZdLGl35L9632DVmuFQ0lr/8WNL/NrAJNtI6PXrZMNiza0/omPwPfe5ZYuD1Jgq59TX4h9d+3fdkArcJYL7AdoMZON1YEiWY5EzazQwtHd9yzdty9ZHPxAfuOfCh4OhbhFNp+v5YQ+PzKZ+UpM1VxV863+9XgWEURPNvX7qq1cpUSRzrSGq01QBBM3MKzRh5mAgqIdXgtl7L0EXAep0MECc7QY0/o3tW3VR8eEJGsSzrNxpFItqj0SEaIWo25dRfkl5zuw47GQrN9Qzxl2WV3A38MQPUqFtIr/71Rjkphgg49ZGWEYCwgFmm8jJc2/5qTabSGk4bzwiETCTzeydq30bUGqCwglj8CrFViAuQeTJm7dp+PYKMkUNvQRpnSXMj6Kz7rvAMzhzJgK62ltN2idqKxLC7WtivCUgejuQUvNreCYBQCaKwTwP02lZsJpGF9yw8gbyuoB+2aB7IZmgIB8GP4qVQ/ht5B9z/FLohK/8cSPV/4i32SNNdcwhV',
        //     sessionResult:
        //         'X3XtfGC7!H4sIAAAAAAAA/6tWykxRslJyDjaxNDMyM3E2MXIyNDUys3RU0lHKTS1KzkjMK3FMTs4vzSsBKgtJLS7xhYo6Z6QmZ+eXlgAVFpcklpQWA+WLUtNKi1NTlGoBMEEbz1cAAAA=iMsCaEJ5LcnsqIUtmNxjm8HtfQ8gZW8JewEU3wHz4qg='
        // };
    }

    protected onComplete(state): void {
        this.handleAdditionalDetails(state);
    }

    protected handleError = (error: AdyenCheckoutError): void => {
        /**
         * Set status using elementRef, which:
         * - If Drop-in, will set status for Dropin component, and then it will propagate the new status for the active payment method component
         * - If Component, it will set its own status
         */
        this.setElementStatus('ready');

        if (error.name === NETWORK_ERROR && error.options.code) {
            const event = new AnalyticsErrorEvent({
                component: this.type,
                errorType: ErrorEventType.apiError,
                code: error.options.code
            });

            this.submitAnalytics(event);
        }

        if (this.props.onError) {
            this.props.onError(error, this.elementRef);
        }
    };

    protected handleAdditionalDetails(state: AdditionalDetailsData): void {
        this.makeAdditionalDetailsCall(state)
            .then(sanitizeResponse)
            .then(verifyPaymentDidNotFail)
            .then(this.handleResponse)
            .catch(this.handleFailedResult);
    }

    private makeAdditionalDetailsCall(state: AdditionalDetailsData): Promise<CheckoutSessionDetailsResponse | CheckoutAdvancedFlowResponse> {
        if (this.props.onAdditionalDetails) {
            return new Promise<CheckoutAdvancedFlowResponse>((resolve, reject) => {
                this.props.onAdditionalDetails(state, this.elementRef, { resolve, reject });
            });
        }

        if (this.core.session) {
            return this.submitAdditionalDetailsUsingSessionsFlow(state.data);
        }

        this.handleError(
            new AdyenCheckoutError(
                'IMPLEMENTATION_ERROR',
                'It can not perform /payments/details call. Callback "onAdditionalDetails" is missing or Checkout session is not available'
            )
        );
    }

    private async submitAdditionalDetailsUsingSessionsFlow(data: any): Promise<CheckoutSessionDetailsResponse> {
        try {
            return await this.core.session.submitDetails(data);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) this.handleError(error);
            else this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /details call', { cause: error }));

            return Promise.reject(error);
        }
    }

    public handleAction(action: PaymentAction, props = {}): UIElement | null {
        if (!action || !action.type) {
            if (hasOwnProperty(action, 'action') && hasOwnProperty(action, 'resultCode')) {
                throw new Error(
                    'handleAction::Invalid Action - the passed action object itself has an "action" property and ' +
                        'a "resultCode": have you passed in the whole response object by mistake?'
                );
            }
            throw new Error('handleAction::Invalid Action - the passed action object does not have a "type" property');
        }

        const paymentAction = this.core.createFromAction(action, {
            ...this.elementRef.props,
            ...props
        });

        if (paymentAction) {
            this.unmount();
            return paymentAction.mount(this._node);
        }

        return null;
    }

    protected onActionHandled(actionHandledObj: ActionHandledReturnObject) {
        this.props?.onActionHandled?.({ originalAction: this.props.originalAction, ...actionHandledObj });
    }

    protected handleOrder = (response: PaymentResponseData): void => {
        const { order } = response;

        const updateCorePromise = this.core.session ? this.core.update({ order }) : this.handleAdvanceFlowPaymentMethodsUpdate(order);

        void updateCorePromise.then(() => {
            this.props.onOrderUpdated?.({ order });
        });
    };

    /**
     * Takes the donationCampaign from the /donationCampaigns call, extracts the relevant props,
     * and combines them with the props required to initialise a DonationComponent
     */
    protected handleDonation(donationCampaign: DonationCampaign) {
        console.log('### UIElement::handleDonation:: donationCampaign', donationCampaign);

        const isDropin = assertIsDropin(this.elementRef);

        DonationCampaignProvider({
            donationCampaign,
            core: this.core,
            originalComponentType: this.type,
            unmountFn: () => {
                const elementRef = isDropin ? this.elementRef : this;
                elementRef.unmount();
            },
            rootNode: isDropin ? this.elementRef._node : this._node
        });

        return;

        const { id, campaignName, ...restDonationCampaignProps } = donationCampaign;

        const donationType = restDonationCampaignProps.donation.type;

        const donationComponentProps: DonationConfiguration = {
            onCancel(data) {
                console.log('### Donation::onCancel:: data', data);
            },
            onDonate: (state: DonationPayload, component: Donation) => {
                const donationRequestData: CheckoutSessionDonationsRequestData = {
                    amount: state.data.amount,
                    donationCampaignId: id,
                    donationType: donationType
                };

                this.callSessionsDonations(donationRequestData, component);
            },
            ...restDonationCampaignProps
        };

        // TODO - decide if we want to differentiate between the implementation for a Dropin and a Component.
        //  Will they both be done via a setStatus call? In which case we could just use: this.setElementStatus('donation', donationComponentProps);
        //  Or will the implementation for a component be different? In which case we need this if-clause
        if (assertIsDropin(this.elementRef)) {
            this.elementRef.setStatus('donation', { configProps: donationComponentProps });

            // alt. to Dropin.setStatus
            //
            // this.elementRef.unmount();
            // const donationComponent: DonationElement = getDonationComponent(TxVariants.donation, this.core, donationComponentProps);
            // if (!donationComponent) {
            //     throw new Error('Donation component is not registered');
            // }
            // donationComponent.mount(this.elementRef._node);
        } else {
            this.unmount();

            const donationComponent: Donation = getDonationComponent(TxVariants.donation, this.core, donationComponentProps);
            if (!donationComponent) {
                throw new Error('Donation component is not registered and so cannot be rendered');
            }
            donationComponent.mount(this._node);
        }
    }

    /**
     * Handles when the payment fails. The payment fails when:
     * - adv flow: the merchant rejects the payment due to a critical error
     * - adv flow: the merchant resolves the payment with a failed resultCode
     * - sessions: a network error occurs when making the payment
     * - sessions: the payment fails with a failed resultCode
     *
     * @param result
     */
    protected handleFailedResult = (result?: PaymentResponseData): void => {
        if (assertIsDropin(this.elementRef)) {
            this.elementRef.displayFinalAnimation('error');
        }

        cleanupFinalResult(result);
        this.props.onPaymentFailed?.(result, this.elementRef);
    };

    protected handleSuccessResult = (result: PaymentResponseData): void => {
        if (assertIsDropin(this.elementRef)) {
            this.elementRef.displayFinalAnimation('success');
        }

        cleanupFinalResult(result);
        this.props.onPaymentCompleted?.(result, this.elementRef);
    };

    /**
     * Handles a /payments or /payments/details response.
     * The component will handle automatically actions, orders, and final results.
     *
     * Expected to be called after sanitizeResponse has been run on the raw payment response
     *
     * @param response -
     */
    protected handleResponse(response: PaymentResponseData): void {
        if (response.action) {
            this.elementRef.handleAction(response.action);
            return;
        }

        if (response.order?.remainingAmount?.value > 0) {
            // we don't want to call elementRef here, use the component handler
            // we do this way so the logic on handlingOrder is associated with payment method
            this.handleOrder(response);
            return;
        }

        this.handleSuccessResult(response);

        /** If the response mandates it - start the flow to present a Donation Component */
        if (this.core.session && response.askDonation === true) {
            this.callSessionsDonationCampaigns();
        }
    }

    private callSessionsDonationCampaigns() {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this.type,
        //     type: LogEventType.donationCampaign, // TODO will need a new type... donationCampaign?
        //     message: 'Sessions flow: calling donationCampaigns endpoint'
        // });
        // this.submitAnalytics(event);

        this.makeSessionsDonationCampaignsCall()
            .then((response: CheckoutSessionDonationCampaignsResponse) => {
                console.log('### UIElement::makeSessionDonationCampaignsCall:: response', response);

                if (response?.donationCampaigns?.length) {
                    console.log('### UIElement::makeSessionDonationCampaignsCall:: HAVE Campaigns');
                    return normalizeDonationCampaign(response.donationCampaigns[0]);
                } else {
                    // TODO - remove mock AND handle this gracefully if no campaigns are returned
                    const mockResp: DonationCampaign[] = [
                        {
                            id: 'DONATION_CAMPAIGN_ID',
                            campaignName: 'DONATION_CAMPAIGN_NAME',
                            donation: {
                                currency: 'EUR',
                                type: 'fixedAmounts',
                                values: [100, 200, 300]
                            },
                            nonprofitName: 'Test Charity',
                            causeName: 'Earthquake Turkey & Syria',
                            nonprofitDescription:
                                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            nonprofitUrl: 'https://example.org',
                            logoUrl: '/logo.png',
                            bannerUrl: '/banner.png',
                            termsAndConditionsUrl: 'https://www.adyen.com'
                        }
                    ];

                    return mockResp[0];
                }
            })
            .then((donationCampaign: DonationCampaign) => {
                // Allow time for success message to show - TODO need to decide how best to handle this
                setTimeout(() => {
                    this.handleDonation(donationCampaign);
                }, 2000);
            })
            .catch((error: unknown) => {
                console.log('### UIElement::makeSessionDonationCampaignsCall:: error', error);
            });
    }

    private async makeSessionsDonationCampaignsCall(): Promise<CheckoutSessionDonationCampaignsResponse> {
        try {
            return await this.core.session.donationCampaigns();
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) {
                this.handleError(error);
            } else {
                this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /donationCampaigns call', { cause: error }));
            }

            return Promise.reject(error);
        }
    }

    private callSessionsDonations(donationRequestData: CheckoutSessionDonationsRequestData, component: Donation) {
        // TODO add analytics
        // const event = new AnalyticsLogEvent({
        //     component: this.type,
        //     type: LogEventType.donationFromSessions, // TODO will need a new type... donationFromSessions?
        //     message: 'Sessions flow: calling donations endpoint'
        // });
        // this.submitAnalytics(event);

        this.makeSessionDonationsCall(donationRequestData)
            .then((response: CheckoutSessionDonationsResponse) => {
                console.log('### UIElement::makeSessionDonationsCall:: response', response);
                if (response.resultCode === 'Authorised') {
                    component.setStatus('success');
                } else {
                    component.setStatus('error');
                }
            })
            .catch((error: unknown) => {
                console.log('### UIElement::makeSessionDonationsCall:: error', error);
            });
    }

    private async makeSessionDonationsCall(donationRequestData: CheckoutSessionDonationsRequestData): Promise<CheckoutSessionDonationsResponse> {
        try {
            return await this.core.session.donations(donationRequestData);
        } catch (error: unknown) {
            if (error instanceof AdyenCheckoutError) {
                this.handleError(error);
            } else {
                this.handleError(new AdyenCheckoutError('ERROR', 'Error when making /donations call', { cause: error }));
            }

            return Promise.reject(error);
        }
    }

    protected handleKeyPress(e: h.JSX.TargetedKeyboardEvent<HTMLInputElement> | KeyboardEvent) {
        if (e.key === 'Enter' || e.code === 'Enter') {
            e.preventDefault(); // Prevent <form> submission if Component is placed inside a form

            this.onEnterKeyPressed(document?.activeElement, this);
        }
    }

    /**
     * Handle Enter key pressed from a UIElement (called via handleKeyPress)
     * @param obj
     */
    protected onEnterKeyPressed(activeElement: Element, component: UIElement) {
        if (this.props.onEnterKeyPressed) {
            this.props.onEnterKeyPressed(activeElement, component);
        } else {
            (activeElement as HTMLElement).blur();
            this.submit();
        }
    }

    /**
     * Call update on parent instance
     * This function exist to make safe access to the protected _parentInstance
     * @param options - CoreOptions
     */
    public updateParent(options: CoreConfiguration = {}): Promise<ICore> {
        return this.elementRef.core.update(options);
    }

    public setComponentRef = (ref: ComponentMethodsRef) => {
        this.componentRef = ref;
    };

    /**
     * Get the current validation status of the element
     */
    public get isValid(): boolean {
        return false;
    }

    /**
     * Get the element icon URL for the current environment
     */
    public get icon(): string {
        const type = this.props.paymentMethodType || this.type;
        return this.props.icon ?? this.resources.getImage()(type);
    }

    /**
     * Get the element's displayable name
     */
    public get displayName(): string {
        const paymentMethodFromResponse = this.core.paymentMethodsResponse?.paymentMethods?.find(pm => pm.type === this.type);
        return this.props.name || paymentMethodFromResponse?.name || this.type;
    }

    /**
     * Get the element accessible name, used in the aria-label of the button that controls selected payment method
     */
    public get accessibleName(): string {
        return this.displayName;
    }

    /**
     * Used to display the second line of a payment method item
     */
    get additionalInfo(): string {
        return null;
    }

    /**
     * Return the type of an element
     */
    public get type(): string {
        return this.props.type || this.constructor['type'];
    }

    /**
     * Get the payButton component for the current element
     */
    protected payButton = (props: PayButtonProps) => {
        return <PayButton {...props} onClick={this.submit} />;
    };

    /**
     * Used in the Partial Orders flow.
     * When the Order is updated, the merchant can request new payment methods based on the new remaining amount
     *
     * @private
     */
    protected async handleAdvanceFlowPaymentMethodsUpdate(order: Order | null, amount?: PaymentAmount) {
        return new Promise<void | PaymentMethodsResponse>((resolve, reject) => {
            if (!this.props.onPaymentMethodsRequest) {
                return resolve();
            }

            this.props.onPaymentMethodsRequest(
                {
                    ...(order && {
                        order: {
                            orderData: order.orderData,
                            pspReference: order.pspReference
                        }
                    }),
                    locale: this.core.options.locale
                },
                { resolve, reject }
            );
        })
            .catch(error => {
                this.handleError(
                    new AdyenCheckoutError(
                        'IMPLEMENTATION_ERROR',
                        'Something failed during payment methods update or onPaymentMethodsRequest was not implemented',
                        {
                            cause: error
                        }
                    )
                );
            })
            .then(paymentMethodsResponse => {
                // in the case of the session flow we get order, amount, countryCode and shopperLocale from initialize()
                // apply the same logic here for order and amount
                // in the future it might be worth moving this logic to be performed by the core on update()
                // it would make this more consistent
                return this.core.update({
                    ...(paymentMethodsResponse && { paymentMethodsResponse }),
                    order,
                    amount: order ? order.remainingAmount : amount
                });
            });
    }

    protected abstract componentToRender(): h.JSX.Element;

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources} analytics={this.analytics}>
                <SRPanelProvider srPanel={this.srPanel}>
                    <AmountProvider amount={this.props.amount} secondaryAmount={this.props.secondaryAmount} providerRef={this.amountProviderRef}>
                        {this.componentToRender()}
                    </AmountProvider>
                </SRPanelProvider>
            </CoreProvider>
        );
    }
}

export default UIElement;

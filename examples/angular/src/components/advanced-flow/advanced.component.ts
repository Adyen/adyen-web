import { Component, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    AdyenCheckout,
    CoreConfiguration,
    Dropin,
    Card,
    AdyenCheckoutError,
    PaymentCompletedData,
    UIElement,
    PaymentFailedData,
    AdditionalDetailsData,
    AdditionalDetailsActions,
    SubmitActions,
    SubmitData,
    PayPal,
    GooglePay
} from '@adyen/adyen-web';
import { environment } from '../../environments/environment';
import { parseAmount } from '../../utils/amount-utils';
import { DEFAULT_AMOUNT, DEFAULT_COUNTRY, DEFAULT_LOCALE } from '../../utils/constants';
import { AdvancedFlowApiService } from '../../services/AdvancedFlowApi.service';
import { ModeSwitcher } from '../mode-switcher/mode-switcher';

@Component({
    selector: 'adyen-advanced-flow',
    standalone: true,
    templateUrl: './advanced.component.html',
    imports: [ModeSwitcher]
})
export class AdvancedFlow implements OnInit {
    @ViewChild('hook', { static: true })
    hook: ElementRef;

    dropin: Dropin | undefined;

    constructor(
        private apiService: AdvancedFlowApiService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.hook = new ElementRef('');
        this.dropin = undefined;
    }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.createCheckout();
        }
    }

    async createCheckout() {
        const urlParams = new URLSearchParams(window.location.search);

        const countryCode = urlParams.get('countryCode') || DEFAULT_COUNTRY;
        const locale = urlParams.get('locale') || DEFAULT_LOCALE;
        const amount = parseAmount(urlParams.get('amount') || DEFAULT_AMOUNT, countryCode);

        this.apiService.fetchPaymentMethods(countryCode, locale, amount).subscribe(async paymentMethodsResponse => {
            const options: CoreConfiguration = {
                amount,
                countryCode,
                locale,
                environment: 'test',
                clientKey: environment.clientKey,
                paymentMethodsResponse,

                onSubmit: async (state: SubmitData, component: UIElement, actions: SubmitActions) => {
                    this.apiService.makePaymentsCall(state.data, countryCode, locale, amount).subscribe(result => {
                        if (!result.resultCode) {
                            actions.reject();
                            return;
                        }

                        const { resultCode, action, order, donationToken } = result;

                        actions.resolve({
                            resultCode,
                            action,
                            order,
                            donationToken
                        });
                    });
                },

                onAdditionalDetails: async (state: AdditionalDetailsData, component: UIElement, actions: AdditionalDetailsActions) => {
                    this.apiService.makeDetailsCall(state.data).subscribe(result => {
                        if (!result.resultCode) {
                            actions.reject();
                            return;
                        }

                        const { resultCode, action, order, donationToken } = result;

                        actions.resolve({
                            resultCode,
                            action,
                            order,
                            donationToken
                        });
                    });
                },

                onError(error: AdyenCheckoutError) {
                    console.error('Something went wrong', error);
                },

                onPaymentCompleted(data: PaymentCompletedData, element: UIElement) {
                    console.log(data, element);
                },

                onPaymentFailed(data: PaymentFailedData, element: UIElement) {
                    console.log(data, element);
                }
            };

            const checkout = await AdyenCheckout(options);
            this.dropin = new Dropin(checkout, {
                paymentMethodsConfiguration: {
                    card: {
                        _disableClickToPay: true
                    }
                },
                //@ts-ignore
                paymentMethodComponents: [Card, PayPal, GooglePay]
            }).mount(this.hook.nativeElement);
        });
    }
}

import { Component, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    AdyenCheckout,
    CoreConfiguration,
    Dropin,
    Card,
    PaymentCompletedData,
    UIElement,
    AdyenCheckoutError,
    PaymentFailedData,
    PayPal,
    GooglePay
} from '@adyen/adyen-web';
import { environment } from '../../environments/environment';
import { parseAmount } from '../../utils/amount-utils';
import { DEFAULT_AMOUNT, DEFAULT_COUNTRY, DEFAULT_LOCALE } from '../../utils/constants';
import { ModeSwitcher } from '../mode-switcher/mode-switcher';
import { SessionsFlowApi } from '../../services/SessionsFlowApi.service';

@Component({
    selector: 'adyen-sessions-flow',
    templateUrl: './sessions.component.html',
    imports: [ModeSwitcher]
})
export class SessionsFlow implements OnInit {
    @ViewChild('hook', { static: true })
    hook: ElementRef;

    dropin: Dropin | undefined;

    constructor(
        private apiService: SessionsFlowApi,
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
        const locale = urlParams.get('shopperLocale') || DEFAULT_LOCALE;
        const amount = parseAmount(urlParams.get('amount') || DEFAULT_AMOUNT, countryCode);

        this.apiService.createSession(countryCode, locale, amount).subscribe(async session => {
            const options: CoreConfiguration = {
                session: {
                    id: session.id,
                    sessionData: session.sessionData
                },
                countryCode,
                locale,
                environment: 'test',
                clientKey: environment.clientKey,

                onError(error: AdyenCheckoutError) {
                    console.error('Something went wrong', error);
                },
                onPaymentCompleted(data: PaymentCompletedData, element: UIElement) {
                    console.log('onPaymentCompleted', data, element);
                },
                onPaymentFailed(data: PaymentFailedData, element: UIElement) {
                    console.log('onPaymentFailed', data, element);
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

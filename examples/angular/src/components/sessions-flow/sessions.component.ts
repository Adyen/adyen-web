import { Component, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import {
    AdyenCheckout,
    CoreConfiguration,
    Dropin,
    Card,
    PaymentCompletedData,
    UIElement,
    AdyenCheckoutError,
    PaymentFailedData
} from '@adyen/adyen-web/auto';

import { environment } from '../../environments/environment';
import { ApiService } from '../../services/api.service';
import { parseAmount } from '../../utils/amount-utils';
import { DEFAULT_AMOUNT, DEFAULT_COUNTRY, DEFAULT_LOCALE } from '../../utils/constants';

@Component({
    selector: 'adyen-sessions',
    standalone: true,
    templateUrl: './sessions.component.html'
})
export class SessionsFlow implements OnInit {
    @ViewChild('hook', { static: true })
    hook: ElementRef;

    dropin: Dropin | undefined;

    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
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
                paymentMethodComponents: [Card]
            }).mount(this.hook.nativeElement);
        });
    }
}

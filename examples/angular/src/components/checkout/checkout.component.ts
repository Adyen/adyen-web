import { Component, ElementRef, ViewChild, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AdyenCheckout, CoreConfiguration, Dropin, Card } from '@adyen/adyen-web';

import { environment } from '../../environments/environment';
import { ApiService } from '../../services/api.service';
import { parseAmount } from '../../utils/amount-utils';
import { DEFAULT_AMOUNT, DEFAULT_COUNTRY, DEFAULT_LOCALE } from '../../utils/constants';

@Component({
    selector: 'checkout',
    standalone: true,
    templateUrl: './checkout.component.html'
})
export class Checkout implements OnInit {
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
                clientKey: environment.clientKey
            };

            const checkout = await AdyenCheckout(options);
            this.dropin = new Dropin(checkout, {
                //@ts-ignore
                paymentMethodComponents: [Card]
            }).mount(this.hook.nativeElement);
        });
    }
}

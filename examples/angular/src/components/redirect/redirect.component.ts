import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    AdyenCheckout,
    AdyenCheckoutError,
    PaymentCompletedData,
    UIElement,
    PaymentFailedData,
    AdditionalDetailsData,
    AdditionalDetailsActions
} from '@adyen/adyen-web/auto';
import { environment } from '../../environments/environment';
import { AdvancedFlowApiService } from '../../services/AdvancedFlowApi.service';

@Component({
    selector: 'adyen-sessions',
    standalone: true,
    templateUrl: './redirect.component.html'
})
export class RedirectPage implements OnInit {
    response: any;

    constructor(
        private apiService: AdvancedFlowApiService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.handleRedirectResult();
        }
    }

    async handleRedirectResult() {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectResult = urlParams.get('redirectResult');
        const sessionId = urlParams.get('sessionId');

        if (!redirectResult) {
            this.response = 'No redirectResult available';
            return;
        }

        const isSessionsFlow = !!sessionId;

        const checkout = await AdyenCheckout({
            analytics: {
                enabled: false
            },
            clientKey: environment.clientKey,
            environment: 'test',
            countryCode: 'US',

            // If it is sessions flow, pass the sessionId back to the library
            ...(isSessionsFlow && {
                session: {
                    id: sessionId
                }
            }),

            // If it is NOT sessions flow, add the 'onAdditionalDetails' so you can handle the /payment/details part here
            ...(!isSessionsFlow && {
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
                }
            }),

            onPaymentCompleted: (data: PaymentCompletedData, component?: UIElement) => {
                this.response = JSON.stringify(data, null, '\t');
            },
            onPaymentFailed: (data?: PaymentFailedData, component?: UIElement) => {
                this.response = 'Payment failed';
            },
            onError: (error: AdyenCheckoutError) => {
                this.response = 'Something went wrong';
                console.error(error);
            }
        });

        checkout.submitDetails({ details: { redirectResult } });
    }
}

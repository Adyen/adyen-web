import { http, HttpResponse } from 'msw';
import emiOfferMock from '../paymentResponseOfferMock.json';

const SETUP_URL_PATTERN = 'https://checkoutshopper-*.adyen.com/checkoutshopper/v1/sessions/*/setup*';

export function createEMISetupHandler(baseSetupResponse?: Record<string, unknown>) {
    return http.post(SETUP_URL_PATTERN, async ({ request }) => {
        const requestData = await request.json();

        const defaultSetupResponse = {
            id: 'mock-session-id',
            sessionData: 'mock-session-data',
            countryCode: 'IN',
            amount: { value: 100000, currency: 'INR' },
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            returnUrl: 'https://localhost:3020/',
            shopperLocale: 'en-US',
            configuration: { enableStoreDetails: false },
            paymentMethods: {
                paymentMethods: [
                    {
                        brands: ['visa', 'mc', 'rupay'],
                        name: 'Credit Card',
                        type: 'scheme'
                    },
                    emiOfferMock
                ]
            },
            ...baseSetupResponse
        };

        return HttpResponse.json({
            ...defaultSetupResponse,
            // @ts-ignore - requestId may exist
            requestId: requestData?.requestId
        });
    });
}

export const emiSetupHandler = createEMISetupHandler();

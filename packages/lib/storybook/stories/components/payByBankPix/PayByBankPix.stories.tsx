import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../types';
import { ComponentContainer } from '../../ComponentContainer';
import { Checkout } from '../../Checkout';
import PayByBankPix from '../../../../src/components/PayByBankPix';
import { PayByBankPixConfiguration } from '../../../../src/components/PayByBankPix/types';
import { http, HttpResponse } from 'msw';
import SimulatedIssuer from './SimulatedIssuer';

type PixBiometricStory = StoryConfiguration<PayByBankPixConfiguration>;

const meta: MetaConfiguration<PayByBankPixConfiguration> = {
    title: 'Components/PayByBankPix'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PayByBankPixConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new PayByBankPix(checkout, componentConfiguration)} />}
    </Checkout>
);

export const MerchantPage: PixBiometricStory = {
    render,
    args: {
        useSessions: false,
        countryCode: 'BR',
        componentConfiguration: { _isNativeFlow: false }
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://localhost:3020/payments', () => {
                    return HttpResponse.json({
                        action: {
                            paymentMethodType: 'paybybank_pix',
                            type: 'redirect', // “await” when on mobile device
                            url: 'https://localhost:3020/iframe.html?globals=&args=&id=components-paybybankpix--simulate-hosted-page&viewMode=story', // issuer’s app/page url
                            method: 'GET'
                        },
                        resultCode: 'RedirectShopper'
                    });
                })
            ]
        }
    }
};

export const SimulateHostedPage: PixBiometricStory = {
    render,
    args: {
        useSessions: false,
        countryCode: 'BR',
        componentConfiguration: { _isNativeFlow: true }
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://localhost:3020/payments', () => {
                    return HttpResponse.json({
                        action: {
                            paymentMethodType: 'paybybank_pix',
                            type: 'redirect', // “await” when on mobile device
                            url: 'https://localhost:3020/iframe.html?args=&globals=&id=components-paybybankpix--simulate-issuer-page&viewMode=story',
                            method: 'GET'
                        },
                        resultCode: 'RedirectShopper'
                    });
                }),
                http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
                    return HttpResponse.json({
                        payload: '',
                        resultCode: 'pending',
                        type: 'pending'
                    });
                })
            ]
        }
    }
};

export const SimulateIssuerPage: PixBiometricStory = {
    render: () => <SimulatedIssuer />
};

export default meta;

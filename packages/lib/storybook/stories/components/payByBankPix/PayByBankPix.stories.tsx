import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../types';
import { ComponentContainer } from '../../ComponentContainer';
import { Checkout } from '../../Checkout';
import PayByBankPix from '../../../../src/components/PayByBankPix';
import { PayByBankPixConfiguration } from '../../../../src/components/PayByBankPix/types';
import { http, HttpResponse } from 'msw';
import SimulatedIssuer from './SimulatedIssuer';
import {
    mockPaymentsResponseMerchantPage,
    mockPaymentsResponseSimulateHostedPage,
    mockStatusResponseSimulateHostedPage,
    mockSubmitDetailsResponseSimulateHostedPage
} from './mocks';

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
        componentConfiguration: { _isNativeFlow: false, deviceId: 'xxx', riskSignals: { isRootedDevice: true } }
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://localhost:3020/payments', () => {
                    return HttpResponse.json(mockPaymentsResponseMerchantPage);
                }),
                http.post('/details', () => {
                    return HttpResponse.json();
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
        amount: 0,
        componentConfiguration: {
            _isNativeFlow: true,
            onChange: data => {
                console.log({ data });
            }
        }
    },
    parameters: {
        msw: {
            handlers: [
                http.post('https://localhost:3020/payments', () => {
                    return HttpResponse.json(mockPaymentsResponseSimulateHostedPage);
                }),
                http.post('https://checkoutshopper-test.adyen.com/checkoutshopper/services/PaymentInitiation/v1/status', () => {
                    return HttpResponse.json(mockStatusResponseSimulateHostedPage);
                }),
                http.post('/details', () => {
                    return HttpResponse.json(mockSubmitDetailsResponseSimulateHostedPage);
                })
            ]
        }
    }
};

export const SimulateIssuerPage: PixBiometricStory = {
    render: () => <SimulatedIssuer />
};

export default meta;

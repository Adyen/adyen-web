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
    mockPendingStatusSimulateHostedPage,
    mockReceivedStatusSimulateHostedPage,
    mockSubmitDetailsResponseSimulateHostedPage
} from './mocks';
import { SimulatedHostedPage } from './SimulatedHostedPage';
import { getSearchParameter } from '../../../utils/get-query-parameters';

type PixBiometricStory = StoryConfiguration<PayByBankPixConfiguration>;

const meta: MetaConfiguration<PayByBankPixConfiguration> = {
    title: 'Components/PayByBankPix'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PayByBankPixConfiguration>) => (
    <>
        <h1>Merchant page</h1>
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PayByBankPix(checkout, componentConfiguration)} />}
        </Checkout>
    </>
);

export const MerchantPage: PixBiometricStory = {
    render,
    args: {
        useSessions: false,
        countryCode: 'BR',
        amount: 0,
        componentConfiguration: { _isAdyenHosted: false }
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
    render: props => <SimulatedHostedPage {...props} />,
    args: {
        useSessions: false,
        countryCode: 'BR',
        redirectResult: getSearchParameter('redirectResult'),
        componentConfiguration: {
            _isAdyenHosted: true,
            // stored pm
            amount: { value: 20000, currency: 'BRL' },
            storedPaymentMethodId: 'xxxxx',
            issuer: 'pix',
            receiver: 'Sue Lar Comercia LTDA',
            paymentDate: '31/08/2023 as 11;49',
            paymentMethod: 'Pix Open Finance',
            // enrollment
            issuers: [{ id: 'issuerId_123', name: 'issuer 123' }],
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
                http.get(
                    'https://checkoutshopper-test.adyen.com/checkoutshopper/services/registration-option/enrollment123?clientKey=test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
                    () => {
                        return HttpResponse.json(
                            getSearchParameter('pollStatus') === 'pending'
                                ? mockPendingStatusSimulateHostedPage
                                : mockReceivedStatusSimulateHostedPage
                        );
                    }
                ),
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

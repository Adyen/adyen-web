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
    mockPostEnrollmentResponse,
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
        amount: 0,
        redirectResult: getSearchParameter('redirectResult'),
        componentConfiguration: {
            _isAdyenHosted: true,
            issuers: [
                {
                    id: '0b919e9b-bee0-4549-baa3-bb6d003575ce',
                    name: 'Iniciador Mock Bank'
                }
            ],
            onChange: data => {
                console.log({ data });
            }
        }
    },
    parameters: {
        msw: {
            handlers: [
                http.post(
                    'https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/redirect-result?clientKey=test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
                    () => {
                        return HttpResponse.json(mockPostEnrollmentResponse);
                    }
                ),
                http.post('https://localhost:3020/payments', () => {
                    return HttpResponse.json(mockPaymentsResponseSimulateHostedPage);
                }),
                http.get(
                    'https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/registration-options/enrollment123?clientKey=test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
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

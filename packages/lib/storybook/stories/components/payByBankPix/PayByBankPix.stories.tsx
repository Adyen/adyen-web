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
        sessionData: {
            recurringProcessingModel: 'CardOnFile',
            shopperInteraction: 'ContAuth',
            shopperName: {
                firstName: 'Yu',
                lastName: 'Long'
            }
        },
        redirectResult: getSearchParameter('redirectResult'),
        componentConfiguration: {
            _isAdyenHosted: true,
            //storedPaymentMethodId: 'xxx',
            issuers: [
                {
                    disabled: false,
                    id: '44b193ac-a348-4b6e-acd9-9a3a57bb4ca4',
                    name: 'Nubank'
                },
                {
                    disabled: false,
                    id: '97592125-061f-4acc-88c8-89c8fff82da2',
                    name: 'Banco do Brasil'
                },
                {
                    disabled: true,
                    id: '7188fdf4-a9b3-42d9-80ca-4f6b695eeaae',
                    name: 'NEON'
                },
                {
                    disabled: false,
                    id: 'c3d9e622-49a4-417a-917b-0c8151a5342d',
                    name: 'Iti'
                },
                {
                    disabled: false,
                    id: 'aeed85b5-c3dc-4f31-8d2d-12d15552ada7',
                    name: 'Picpay QA'
                },
                {
                    disabled: false,
                    id: '38c17d7d-b224-4693-aa24-9122fdc8a7cf',
                    name: 'pagseguro'
                },
                {
                    disabled: false,
                    id: '73963528-9732-41ac-888b-138fec3b4ddb',
                    name: 'Stone Auth Server'
                },
                {
                    disabled: false,
                    id: '07b7bd3a-fb8d-43a9-b17f-712356007bde',
                    name: 'Banco Santander Pessoa Física'
                },
                {
                    disabled: false,
                    id: '97aa6093-676d-4547-b3dc-2449b4a6edde',
                    name: 'next'
                },
                {
                    disabled: false,
                    id: '414d34f0-9269-401f-a160-abf51141da3d',
                    name: 'Bradesco PJ'
                },
                {
                    disabled: false,
                    id: '0b919e9b-bee0-4549-baa3-bb6d003575ce',
                    name: 'Iniciador Mock Bank'
                },
                {
                    disabled: false,
                    id: 'bb2cb3f4-118b-411b-b09e-f13c04e5a292',
                    name: 'Quero-Quero PAG - HML 2'
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

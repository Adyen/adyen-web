import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../types';
import { ComponentContainer } from '../../ComponentContainer';
import { Checkout } from '../../Checkout';
import PayByBankPix from '../../../../src/components/PayByBankPix';
import { PayByBankPixConfiguration } from '../../../../src/components/PayByBankPix/types';
import { http, HttpResponse } from 'msw';
import SimulatedIssuer from './SimulatedIssuer';
import {
    mockEnrollmentPayload,
    mockPaymentsResponseMerchantPage,
    mockPaymentsResponseEnrollment,
    mockPendingStatusSimulateHostedPage,
    mockPostEnrollmentResponse,
    mockReceivedStatusSimulateHostedPage,
    mockSubmitDetailsResponseSimulateHostedPage,
    mockPaymentsResponsePayment,
    mockReceivedStatusPayment,
    mockDetailsResponseRedirectEnrollment
} from './mocks';
import { SimulatedHostedPage } from './SimulatedHostedPage';
import { getSearchParameter } from '../../../utils/get-query-parameters';

type PixBiometricStory = StoryConfiguration<PayByBankPixConfiguration>;

const meta: MetaConfiguration<PayByBankPixConfiguration> = {
    title: 'Components/PayByBankPix'
};

const useMsw = true;
let detailsCallCount = 0;

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
        componentConfiguration: { _isAdyenHosted: false }
    },
    parameters: {
        msw: useMsw
            ? {
                  handlers: [
                      http.post('https://localhost:3020/api/payments', () => {
                          return HttpResponse.json(mockPaymentsResponseMerchantPage);
                      }),
                      http.post('/api/details', () => {
                          return HttpResponse.json();
                      })
                  ]
              }
            : undefined
    }
};

export const HostedPageEnrollment: PixBiometricStory = {
    render: props => <SimulatedHostedPage {...props} />,
    args: {
        useSessions: false,
        countryCode: 'BR',
        shopperReference: 'leonardo-12345',
        amount: 0,
        // @ts-ignore override the /sessions payload
        sessionData: mockEnrollmentPayload,
        redirectResult: getSearchParameter('redirectResult'),
        sessionId: getSearchParameter('sessionId'),
        componentConfiguration: {
            _isAdyenHosted: true,
            onChange: data => {
                console.log({ data });
            }
        }
    },
    parameters: {
        msw: useMsw
            ? {
                  handlers: [
                      http.post(
                          'https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/redirect-result?clientKey=test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
                          () => {
                              return HttpResponse.json(mockPostEnrollmentResponse);
                          }
                      ),
                      http.post('https://localhost:3020/api/payments', () => {
                          return HttpResponse.json(mockPaymentsResponseEnrollment);
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
                      http.post('/api/details', () => {
                          detailsCallCount++;
                          if (detailsCallCount === 1) {
                              return HttpResponse.json(mockSubmitDetailsResponseSimulateHostedPage);
                          } else {
                              return HttpResponse.json(mockDetailsResponseRedirectEnrollment);
                          }
                      })
                  ]
              }
            : undefined
    }
};
export const HostedPagePayment: PixBiometricStory = {
    render: props => <SimulatedHostedPage {...props} />,
    args: {
        useSessions: false,
        countryCode: 'BR',
        shopperReference: 'leonardo-12345',
        amount: 3000,
        // @ts-ignore override the /sessions payload
        sessionData: mockEnrollmentPayload,
        componentConfiguration: {
            _isAdyenHosted: true,
            deviceId: 'b9be0556-a449-467b-a74a-18ab9754f907',
            storedPaymentMethodId: 'M9WS5DT5PGCM9J65',
            receiver: 'xxx',
            //issuer: '44471172',
            onChange: data => {
                console.log({ data });
            }
        }
    },
    parameters: {
        msw: useMsw
            ? {
                  handlers: [
                      http.post(
                          'https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/redirect-result?clientKey=test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
                          () => {
                              return HttpResponse.json(mockPostEnrollmentResponse);
                          }
                      ),
                      http.post('https://localhost:3020/api/payments', () => {
                          return HttpResponse.json(mockPaymentsResponsePayment);
                      }),
                      http.get(
                          'https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/authorization-options?initiationId=initiation123&enrollmentId=enrollment123&clientKey=test_L6HTEOAXQBCZJHKNU4NLN6EI7IE6VRRW',
                          () => {
                              return HttpResponse.json(
                                  getSearchParameter('pollStatus') === 'pending' ? mockPendingStatusSimulateHostedPage : mockReceivedStatusPayment
                              );
                          }
                      ),
                      http.post('/api/details', () => {
                          return HttpResponse.json(mockSubmitDetailsResponseSimulateHostedPage);
                      })
                  ]
              }
            : undefined
    }
};

export const SimulateIssuerPage: PixBiometricStory = {
    render: () => <SimulatedIssuer />
};

export default meta;

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
const useMsw = false;

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
                      http.post('https://localhost:3020/payments', () => {
                          return HttpResponse.json(mockPaymentsResponseMerchantPage);
                      }),
                      http.post('/details', () => {
                          return HttpResponse.json();
                      })
                  ]
              }
            : undefined
    }
};

export const SimulateHostedPage: PixBiometricStory = {
    render: props => <SimulatedHostedPage {...props} />,
    argTypes: {
        // @ts-ignore fix later
        isEnrollment: {
            control: { type: 'boolean' }
        },
        // Hide the amount control when `isEnrollment` is true. Because the amount defaults to 0.
        amount: { if: { arg: 'isEnrollment', truthy: false } }
    },
    args: {
        isEnrollment: true,
        useSessions: false,
        countryCode: 'BR',
        //_environmentUrls: { cdn: { images: 'https://localhost:3020/' } },
        // @ts-ignore override the /sessions payload
        sessionData: mockEnrollmentPayload,
        redirectResult: getSearchParameter('redirectResult'),
        componentConfiguration: {
            _isAdyenHosted: true,
            /*            //storedPaymentMethodId: 'xxx',
            receiver: 'xxx',
            issuer: 'bank',*/
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
            : undefined
    }
};

export const SimulateIssuerPage: PixBiometricStory = {
    render: () => <SimulatedIssuer />
};

export default meta;

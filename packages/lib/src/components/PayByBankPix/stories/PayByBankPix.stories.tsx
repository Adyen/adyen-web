import { Fragment, h } from 'preact';
import PayByBankPix from '..';
import { PayByBankPixConfiguration } from '../types';
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
    mockDetailsResponseRedirectEnrollment,
    mockPaymentsResponsePayment,
    mockReceivedStatusPayment
} from './mocks';
import { SimulatedHostedPage } from './SimulatedHostedPage';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../storybook/types';
import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { SHOPPER_REFERENCE } from '../../../../storybook/config/commonConfig';
import { getSearchParameter } from '../../../../storybook/utils/get-query-parameters';

type PixBiometricStory = StoryConfiguration<PayByBankPixConfiguration>;

const meta: MetaConfiguration<PayByBankPixConfiguration> = {
    title: 'Components/PayByBankPix'
};

const useMsw = false;
let detailsCallCount = 0;

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PayByBankPixConfiguration>) => (
    <Fragment>
        <h1>Merchant page</h1>
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PayByBankPix(checkout, componentConfiguration)} />}
        </Checkout>
    </Fragment>
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
                      http.post('/api/payments/details', () => {
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
        shopperReference: SHOPPER_REFERENCE,
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
                          `https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/redirect-result?clientKey=${process.env.CLIENT_KEY}`,
                          () => {
                              return HttpResponse.json(mockPostEnrollmentResponse);
                          }
                      ),
                      http.post('https://localhost:3020/api/payments', () => {
                          return HttpResponse.json(mockPaymentsResponseEnrollment);
                      }),
                      http.get(
                          `https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/registration-options/enrollment123?clientKey=${process.env.CLIENT_KEY}`,
                          () => {
                              return HttpResponse.json(
                                  getSearchParameter('pollStatus') === 'pending'
                                      ? mockPendingStatusSimulateHostedPage
                                      : mockReceivedStatusSimulateHostedPage
                              );
                          }
                      ),
                      http.post('/api/payments/details', () => {
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
    render: props => (
        <Fragment>
            <span>Mock only, go to drop-in to test this flow.</span>
            <br />
            <span>First create an enrollment, and pay with the enrolled device</span>
            <SimulatedHostedPage {...props} />
        </Fragment>
    ),
    args: {
        useSessions: false,
        countryCode: 'BR',
        shopperReference: SHOPPER_REFERENCE,
        amount: 3000,
        // @ts-ignore override the /sessions payload
        sessionData: mockEnrollmentPayload,
        componentConfiguration: {
            _isAdyenHosted: true,
            storedPaymentMethodId: 'mock_stored_id',
            payByBankPixDetails: { deviceId: 'replace_with_your_enrolled_device_id', ispb: 'xx', receiver: 'xxx' },
            onChange: data => {
                console.log({ data });
            }
        }
    },
    parameters: {
        msw: {
            handlers: [
                http.post(
                    `https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/redirect-result?clientKey=${process.env.CLIENT_KEY}`,
                    () => {
                        return HttpResponse.json(mockPostEnrollmentResponse);
                    }
                ),
                http.post('https://localhost:3020/api/payments', () => {
                    return HttpResponse.json(mockPaymentsResponsePayment);
                }),
                http.get(
                    `https://checkoutshopper-test.adyen.com/checkoutshopper/utility/v1/pixpaybybank/authorization-options?initiationId=initiation123&enrollmentId=enrollment123&clientKey=${process.env.CLIENT_KEY}`,
                    () => {
                        return HttpResponse.json(
                            getSearchParameter('pollStatus') === 'pending' ? mockPendingStatusSimulateHostedPage : mockReceivedStatusPayment
                        );
                    }
                ),
                http.post('/api/payments/details', () => {
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

import { MetaConfiguration, PaymentMethodStoryProps } from '../types';
import { DropinConfiguration } from '../../../src/components/Dropin/types';
import { AdyenCheckout, PayByBankPix, Dropin as DropinComponent } from '../../../src';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';
import { getSearchParameter } from '../../utils/get-query-parameters';
import { useEffect, useState } from 'preact/hooks';
import UIElement from '../../../src/components/internal/UIElement';
import { handleError, handleFinalState } from '../../helpers/checkout-handlers';

const meta: MetaConfiguration<DropinConfiguration> = {
    title: 'Dropin/PayByBankPix',
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsOverride: {
            control: 'object',
            if: { arg: 'useSessions', truthy: false }
        },
        sessionData: {
            control: 'object',
            if: { arg: 'useSessions', truthy: true }
        }
    }
};
const render = ({ redirectResult, sessionId, componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DropinConfiguration>) => {
    AdyenCheckout.register(PayByBankPix);
    const [element, setElement] = useState<UIElement>(null);

    useEffect(() => {
        if (redirectResult && sessionId) {
            void AdyenCheckout({
                clientKey: process.env.CLIENT_KEY,
                // @ts-ignore CLIENT_ENV has valid value
                environment: process.env.CLIENT_ENV,
                countryCode: checkoutConfig.countryCode,
                ...(sessionId && { session: { id: sessionId, countryCode: checkoutConfig.countryCode } }),

                afterAdditionalDetails: (actionElement: UIElement) => {
                    if (actionElement) {
                        // @ts-ignore simulate hosted checkout page locally
                        actionElement.props._isAdyenHosted = true;
                        void actionElement.isAvailable().then(() => {
                            setElement(actionElement);
                        });
                    }
                },
                onPaymentCompleted: (result, component) => {
                    console.log('payment completed');
                    handleFinalState(result, component);
                },

                onPaymentFailed: (result, component) => {
                    handleFinalState(result, component);
                },
                onError: (error, component) => {
                    handleError(error, component);
                    handleFinalState({ resultCode: error.message ?? 'Error' }, component);
                }
            }).then(checkout => {
                checkout.submitDetails({ details: { redirectResult } });
            });
        }
    }, [redirectResult, sessionId]);

    if (redirectResult) {
        return <>{element ? <ComponentContainer element={element} /> : 'Submitting details...'}</>;
    }

    return (
        !redirectResult && (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
            </Checkout>
        )
    );
};

export const CreateEnrollment = {
    name: 'Create enrollment (sessions)',
    args: {
        useSessions: true,
        countryCode: 'BR',
        shopperLocale: 'en-US',
        amount: 0,
        showPayButton: true,
        sessionData: {
            returnUrl: `${window.location.protocol}://localhost:3020/iframe.html?args=&globals=&id=dropin-paybybankpix--create-enrollment&viewMode=story`,
            socialSecurityNumber: '81421811006',
            storePaymentMethodMode: 'enabled',
            recurringProcessingModel: 'CardOnFile',
            shopperInteraction: 'ContAuth',
            shopperName: {
                firstName: 'Yu',
                lastName: 'Long'
            }
        },
        redirectResult: getSearchParameter('redirectResult'),
        sessionId: getSearchParameter('sessionId'),
        componentConfiguration: {
            showStoredPaymentMethods: false,
            showRemovePaymentMethodButton: false,
            paymentMethodsConfiguration: {
                paybybank_pix: {
                    _isAdyenHosted: true
                }
            }
        }
    },
    render
};

export const PayWithEnrolledDevice = {
    name: 'Pay with enrolled device (sessions)',
    args: {
        useSessions: true,
        countryCode: 'BR',
        shopperLocale: 'en-US',
        amount: 1000,
        showPayButton: true,
        sessionData: {
            returnUrl: `${window.location.protocol}://localhost:3020/iframe.html?args=&globals=&id=dropin-paybybankpix--create-enrollment&viewMode=story`,
            socialSecurityNumber: '81421811006',
            storePaymentMethodMode: 'enabled',
            recurringProcessingModel: 'CardOnFile',
            shopperInteraction: 'ContAuth',
            shopperName: {
                firstName: 'Yu',
                lastName: 'Long'
            }
        },
        componentConfiguration: {
            showRemovePaymentMethodButton: false,
            paymentMethodsConfiguration: {
                paybybank_pix: {
                    _isAdyenHosted: true
                }
            }
        }
    },
    render
};

export default meta;

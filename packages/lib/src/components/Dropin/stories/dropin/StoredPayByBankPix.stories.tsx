import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { PayByBankPix } from "../../..";
import { MetaConfiguration, PaymentMethodStoryProps } from "../../../../../storybook/types";
import { AdyenCheckout, OnChangeData, UIElement } from "../../../../types";
import { DropinConfiguration } from "../../types";
import { handleError, handleFinalState } from "../../../../../storybook/helpers/checkout-handlers";
import DropinComponent from '../../Dropin';
import { getSearchParameter } from "../../../../../storybook/utils/get-query-parameters";
import { Checkout } from "../../../../../storybook/components/Checkout";
import { ComponentContainer } from "../../../../../storybook/components/ComponentContainer";
import { mockEnrollmentPayload } from "../../../PayByBankPix/stories/mocks";

const meta: MetaConfiguration<DropinConfiguration> = {
    title: 'Components/Dropin/PayByBankPix',
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
        return <Fragment>{element ? <ComponentContainer element={element} /> : 'Submitting details...'}</Fragment>;
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
            ...mockEnrollmentPayload,
            returnUrl: `${globalThis.location.origin}/iframe.html?args=&globals=&id=components-dropin-paybybankpix--create-enrollment&viewMode=story`
        },
        redirectResult: getSearchParameter('redirectResult'),
        sessionId: getSearchParameter('sessionId'),
        componentConfiguration: {
            showStoredPaymentMethods: false,
            showRemovePaymentMethodButton: false,
            paymentMethodsConfiguration: {
                paybybank_pix: {
                    onChange: (state: OnChangeData) => {
                        console.log({ state });
                    },
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
            ...mockEnrollmentPayload,
            returnUrl: `${globalThis.location.origin}/iframe.html?args=&globals=&id=components-dropin-paybybankpix--create-enrollment&viewMode=story`
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
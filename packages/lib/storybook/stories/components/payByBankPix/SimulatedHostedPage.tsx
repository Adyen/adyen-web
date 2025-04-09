import { useEffect, useState } from 'preact/hooks';
import { AdyenCheckout } from '../../../../src';
import { AdditionalDetailsData } from '../../../../src/core/types';
import { makeDetailsCall, makePayment } from '../../../helpers/checkout-api-calls';
import { handleError, handleFinalState } from '../../../helpers/checkout-handlers';
import { ComponentContainer } from '../../ComponentContainer';
import PayByBankPix from '../../../../src/components/PayByBankPix/PayByBankPix';
import { PaymentMethodStoryProps } from '../../types';
import { PayByBankPixConfiguration } from '../../../../src/components/PayByBankPix/types';
import { createCheckout } from '../../../helpers/create-checkout';
import UIElement from '../../../../src/components/internal/UIElement';
import getCurrency from '../../../utils/get-currency';
import { mockEnrollmentPayload } from './mocks';

interface ISimulatedHostedPage extends PaymentMethodStoryProps<PayByBankPixConfiguration> {
    redirectResult?: string;
    sessionId?: string;
    isEnrollment?: boolean;
}

export const SimulatedHostedPage = ({ redirectResult, sessionId, isEnrollment, componentConfiguration, ...checkoutConfig }: ISimulatedHostedPage) => {
    const [uiElement, setUiElement] = useState<UIElement>();

    const handleSubmit = async (state, _, actions) => {
        try {
            debugger;
            // testing purpose, change the language to be 2 chars
            state.data.paymentMethod.riskSignals.language = 'en';
            const paymentAmount = {
                currency: getCurrency('BR'),
                value: isEnrollment ? 0 : checkoutConfig.amount.value
            };

            const paymentData = {
                amount: paymentAmount,
                countryCode: 'BR',
                ...mockEnrollmentPayload
            };

            const { action, order, resultCode, donationToken } = await makePayment(state.data, paymentData);

            if (!resultCode) actions.reject();

            actions.resolve({
                resultCode,
                action,
                order,
                donationToken
            });
        } catch (error) {
            console.error('## onSubmit - critical error', error);
            actions.reject();
        }
    };

    const handleAdditionalDetails = (state: AdditionalDetailsData, _, actions) => {
        makeDetailsCall(state.data)
            .then(res => {
                actions.resolve(res);
            })
            .catch(e => {
                console.error({ e });
                actions.reject();
            });
    };

    useEffect(() => {
        if (!redirectResult) {
            void createCheckout({
                ...checkoutConfig,
                onSubmit: handleSubmit
            }).then(checkout => {
                setUiElement(new PayByBankPix(checkout, componentConfiguration));
            });
            return;
        }

        AdyenCheckout.register(PayByBankPix);
        void AdyenCheckout({
            //_environmentUrls: { cdn: { images: 'https://localhost:3020/' } },
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode: checkoutConfig.countryCode,
            ...(sessionId && { session: { id: sessionId, countryCode: checkoutConfig.countryCode } }),
            // Advanced flow
            ...(!sessionId && { onAdditionalDetails: handleAdditionalDetails }),
            afterAdditionalDetails: (actionElement: UIElement) => {
                if (actionElement) {
                    setUiElement(actionElement);
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
    }, []);

    return (
        <>
            <h1>Hosted page</h1>
            {uiElement ? <ComponentContainer element={uiElement} /> : 'Loading...'}
        </>
    );
};

import { useEffect, useState } from 'preact/hooks';
import { AdyenCheckout } from '../../../../src';
import { AdditionalDetailsData } from '../../../../src/core/types';
import { makeDetailsCall } from '../../../helpers/checkout-api-calls';
import { handleError, handleFinalState } from '../../../helpers/checkout-handlers';
import { ComponentContainer } from '../../ComponentContainer';
import PayByBankPix from '../../../../src/components/PayByBankPix/PayByBankPix';
import { PaymentMethodStoryProps } from '../../types';
import { PayByBankPixConfiguration } from '../../../../src/components/PayByBankPix/types';
import { createCheckout } from '../../../helpers/create-checkout';
import UIElement from '../../../../src/components/internal/UIElement';

interface ISimulatedHostedPage extends PaymentMethodStoryProps<PayByBankPixConfiguration> {
    redirectResult?: string;
    sessionId?: string;
}

export const SimulatedHostedPage = ({ redirectResult, sessionId, componentConfiguration, ...checkoutConfig }: ISimulatedHostedPage) => {
    const [componentConfig] = useState(componentConfiguration);
    const [uiElement, setUiElement] = useState<UIElement>();

    useEffect(() => {
        if (!redirectResult) {
            void createCheckout(checkoutConfig).then(checkout => {
                setUiElement(new PayByBankPix(checkout, componentConfig));
            });
            return;
        }

        void AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode: checkoutConfig.countryCode,
            ...(sessionId && { session: { id: sessionId, countryCode: checkoutConfig.countryCode } }),
            // Advanced flow
            ...(!sessionId && {
                onAdditionalDetails: (state: AdditionalDetailsData, _, actions) => {
                    makeDetailsCall(state.data)
                        .then(res => {
                            actions.resolve(res);
                        })
                        .catch(e => {
                            console.error({ e });
                            actions.reject();
                        });
                }
            }),

            onPaymentCompleted: (result, component) => {
                console.log('payment completed');
                handleFinalState(result, component);
            },
            onAction: (actionElement: UIElement) => {
                if (actionElement) {
                    setUiElement(actionElement);
                }
            },
            onPaymentFailed: (result, component) => {
                handleFinalState(result, component);
            },
            onError: (error, component) => {
                handleError(error, component);
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

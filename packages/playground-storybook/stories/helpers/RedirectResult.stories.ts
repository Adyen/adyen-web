import { Meta, StoryFn } from '@storybook/html';
import AdyenCheckout from '@adyen/adyen-web';
import { getSearchParameter } from '../../utils/get-query-parameters';
import { handleError, handleFinalState } from '../../helpers/checkout-handlers';

type RedirectResultProps = {
    redirectResult: string;
    sessionId: string;
};

export default {
    title: 'Helpers/RedirectResult'
} as Meta;

export const RedirectResult: StoryFn<RedirectResultProps> = (props, { loaded: { checkout, errorMessage } }): HTMLElement => {
    const div = document.createElement('div');
    div.setAttribute('id', 'redirect-result-status');

    if (errorMessage) {
        div.innerText = errorMessage;
        return div;
    }
    if (!checkout) {
        div.innerText = 'There is no redirectResult / sessionId provided';
        return div;
    }

    div.innerText = 'Submitting details...';
    checkout.submitDetails({ details: { redirectResult: props.redirectResult } });

    return div;
};

RedirectResult.args = {
    redirectResult: getSearchParameter('redirectResult'),
    sessionId: getSearchParameter('sessionId')
};

RedirectResult.loaders = [
    async context => {
        const { redirectResult, sessionId } = context.args;
        let errorMessage = null;

        if (!redirectResult || !sessionId) {
            return {};
        }

        const checkout = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            environment: process.env.CLIENT_ENV,
            session: { id: sessionId },
            onPaymentCompleted: (result, component) => {
                document.getElementById('redirect-result-status').remove();
                handleFinalState(result, component);
            },
            onError: (error, component) => {
                errorMessage = `${error.name}: ${error.message}`;
                handleError(error, component);
            }
        });

        return { checkout, errorMessage };
    }
];

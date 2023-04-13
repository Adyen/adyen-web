import { Meta, StoryObj } from '@storybook/html';
import AdyenCheckout from '@adyen/adyen-web';
import { getSearchParameter } from '../../utils/get-query-parameters';
import { handleError, handleFinalState } from '../../helpers/checkout-handlers';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';

type RedirectResultProps = {
    redirectResult: string;
    sessionId: string;
};

type RedirectStory = StoryObj<RedirectResultProps>;

const meta: Meta<RedirectResultProps> = {
    title: 'Helpers/RedirectResult'
};
export default meta;

export const RedirectResult: RedirectStory = {
    render: (args, context) => {
        const checkout = getStoryContextCheckout(context);
        const errorMessage = context.loaded?.errorMessage;

        const div = document.createElement('div');
        div.setAttribute('id', 'redirect-result-status');

        if (errorMessage) {
            div.innerText = errorMessage;
            return div;
        }
        if (!args.redirectResult || !args.sessionId || !checkout) {
            div.innerText = 'There is no redirectResult / sessionId provided';
            return div;
        }

        div.innerText = 'Submitting details...';
        checkout.submitDetails({ details: { redirectResult: args.redirectResult } });

        return div;
    },
    args: {
        redirectResult: getSearchParameter('redirectResult'),
        sessionId: getSearchParameter('sessionId')
    },
    loaders: [
        async context => {
            const { redirectResult, sessionId } = context.args;
            let errorMessage = null;

            if (!redirectResult || !sessionId) {
                return {};
            }

            const checkout = await AdyenCheckout({
                clientKey: import.meta.env.VITE_CLIENT_KEY,
                environment: import.meta.env.VITE_CLIENT_ENV,
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
    ]
};

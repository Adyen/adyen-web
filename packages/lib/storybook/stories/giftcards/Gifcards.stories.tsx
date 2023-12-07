import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { ANCVConfiguration } from '../../../src/components/ANCV/types';
import Giftcard from '../../../src/components/Giftcard';
import { GiftCardConfiguration } from '../../../src/components/Giftcard/types';
import { makePayment } from '../../helpers/checkout-api-calls';

type GifcardStory = StoryObj<PaymentMethodStoryProps<GiftCardConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<ANCVConfiguration>> = {
    title: 'Giftcards/Generic Giftcard'
};

export const Default: GifcardStory = {
    render: (args, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const ancv = new Giftcard({ core: checkout, ...componentConfiguration });
        return <Container element={ancv} />;
    },
    args: {
        countryCode: 'NL',
        amount: 200000,
        useSessions: false,
        componentConfiguration: {
            brand: 'genericgiftcard',
            onSubmit: async (state, element, actions) => {
                try {
                    const paymentData = {
                        amount: {
                            value: 200000,
                            currency: 'EUR'
                        },
                        countryCode: 'NL',
                        shopperLocale: 'en-GB'
                    };
                    const result = await makePayment(state.data, paymentData);

                    // happpy flow
                    if (result.resultCode.includes('Refused', 'Cancelled', 'Error')) {
                        actions.reject({
                            error: {
                                googlePayError: {}
                            }
                        });
                    } else {
                        actions.resolve({
                            action: result.action,
                            order: result.order,
                            resultCode: result.resultCode
                        });
                    }
                } catch (error) {
                    // Something failed in the request
                    actions.reject();
                }
            },
            onOrderUpdated(data) {
                // TODO render another component
                alert(JSON.stringify(data));
            }
        }
    }
};
export default meta;

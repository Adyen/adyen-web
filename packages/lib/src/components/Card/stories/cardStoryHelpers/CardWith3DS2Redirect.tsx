import { h } from "preact";
import Card from '../..';
import getCurrency from '../../../../../storybook/utils/get-currency';
import { makePayment } from '../../../../../storybook/helpers/checkout-api-calls';
import { PaymentMethodStoryProps } from '../../../../../storybook/types';
import { CardConfiguration } from '../../types';
import { ComponentContainer } from '../../../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../../../storybook/components/Checkout';

export const CardWith3DS2Redirect = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<CardConfiguration>) => {
    const { countryCode, amount, shopperLocale } = checkoutConfig;
    const cardConfig = {
        ...componentConfiguration,
        onSubmit: async (state, component, actions) => {
            try {
                const paymentData = {
                    amount: { currency: getCurrency(countryCode), value: amount },
                    countryCode,
                    shopperLocale,
                    authenticationData: {
                        // force redirect flow by not specifying threeDSRequestData
                        attemptAuthentication: 'always'
                    }
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
        }
    };

    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const card = new Card(checkout, cardConfig);
                return <ComponentContainer element={card}></ComponentContainer>;
            }}
        </Checkout>
    );
};

import Card from '../../../../src/components/Card';
import getCurrency from '../../../utils/get-currency';
import { makePayment } from '../../../helpers/checkout-api-calls';
import { PaymentMethodStoryProps } from '../../types';
import { CardConfiguration } from '../../../../src/components/Card/types';
import { Container } from '../../Container';

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

    return <Container Element={Card} checkoutConfig={checkoutConfig} componentConfig={cardConfig} />;
};

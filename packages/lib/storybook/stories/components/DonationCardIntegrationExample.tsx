import { useEffect, useRef, useState } from 'preact/hooks';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import { Card } from '../../../src';
import { PaymentMethodStoryProps } from '../types';
import { Container } from '../Container';
import Donation from '../../../src/components/Donation/Donation';
import { createDonation, createDonationCampaigns, makeDetailsCall, makePayment } from '../../helpers/checkout-api-calls';
import { DonationConfiguration } from '../../../src/components/Donation/types';

interface DonationIntegrationExampleProps {
    contextArgs: PaymentMethodStoryProps<DonationConfiguration>;
}

export const DonationCardIntegrationExample = ({ contextArgs }: DonationIntegrationExampleProps) => {
    const checkout = useRef(null);
    const [element, setElement] = useState(null);

    useEffect(() => {
        createCheckout();
    }, [contextArgs]);

    const createCheckout = async () => {
        const { showPayButton, countryCode, shopperLocale, amount } = contextArgs;

        checkout.current = await createAdvancedFlowCheckout({
            showPayButton,
            countryCode,
            shopperLocale,

            // @ts-ignore ignore
            onSubmit: async (state, _, actions) => {
                try {
                    const paymentData = {
                        amount: { value: Number(amount), currency: 'EUR' },
                        countryCode,
                        shopperLocale,
                        returnUrl: 'https://localhost:3020/?path=/story/components-donation--integrate-with-card'
                    };

                    const {
                        action,
                        order,
                        resultCode,
                        donationToken,
                        pspReference,
                        paymentMethod = {}, // For Ideal, we get type = 'ideal' in the response. When making a donation, we need to map the value to 'sepadirectdebit'
                        merchantReference
                    } = await makePayment(state.data, paymentData);

                    if (!resultCode) actions.reject();

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });

                    if (donationToken) {
                        sessionStorage.setItem(
                            'donation',
                            JSON.stringify({
                                donationOriginalPspReference: pspReference,
                                reference: merchantReference,
                                paymentMethod: { type: paymentMethod.type },
                                donationToken
                            })
                        );
                    }
                } catch (error) {
                    console.error('## onSubmit - critical error', error);
                    actions.reject();
                }
            },

            onAdditionalDetails: async (state, _, actions) => {
                try {
                    const {
                        action,
                        order,
                        resultCode,
                        donationToken,
                        pspReference,
                        paymentMethod = {}, // For Ideal, we get type = 'ideal' in the response. When making a donation, we need to map the value to 'sepadirectdebit'
                        merchantReference
                    } = await makeDetailsCall(state.data);

                    if (!resultCode) actions.reject();

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });

                    if (donationToken) {
                        sessionStorage.setItem(
                            'donation',
                            JSON.stringify({
                                donationOriginalPspReference: pspReference,
                                reference: merchantReference,
                                paymentMethod: { type: paymentMethod.type },
                                donationToken
                            })
                        );
                    }
                } catch (error) {
                    console.error('## onAdditionalDetails - critical error', error);
                    actions.reject();
                }
            },

            onPaymentCompleted({ donationToken }) {
                if (donationToken) {
                    tryMountDonation();
                }
            }
        });
        const cardElement = new Card(checkout.current, {
            _disableClickToPay: true
        });
        setElement(cardElement);
    };

    const tryMountDonation = async () => {
        try {
            const { donationCampaigns } = await createDonationCampaigns({ currency: 'EUR' });

            if (donationCampaigns?.length > 0) {
                const firstCampaign = donationCampaigns[0];
                const donationSession = JSON.parse(sessionStorage.getItem('donation'));
                const donationElement = new Donation(checkout.current, {
                    ...firstCampaign,
                    onDonate: ({ data: { amount } }, component) => {
                        createDonation({ amount, donationCampaignId: firstCampaign.id, ...donationSession })
                            .then(res => {
                                if (res.status !== 'refused') {
                                    component.setStatus('success');
                                } else {
                                    component.setStatus('error');
                                }
                            })
                            .catch(error => {
                                component.setStatus('error');
                                console.error(error);
                            })
                            .finally(() => {
                                sessionStorage.removeItem('donation');
                            });
                    },
                    onCancel: () => alert('Donation canceled')
                });
                setElement(donationElement);
            } else {
                alert('Payment completed, no donation config is returned.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return <Container element={element} />;
};

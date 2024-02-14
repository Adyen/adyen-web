import { useEffect, useRef, useState } from 'preact/hooks';
import { createAdvancedFlowCheckout } from '../../helpers/create-advanced-checkout';
import { Card } from '../../../src';
import { PaymentMethodStoryProps } from '../types';
import { Container } from '../Container';
import Donation from '../../../src/components/Donation/Donation';
import { createDonation, createDonationCampaigns, makePayment } from '../../helpers/checkout-api-calls';
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
                        shopperLocale
                    };

                    const {
                        action,
                        order,
                        resultCode,
                        donationToken,
                        pspReference,
                        paymentMethod: { type }, // For Ideal, we get type = 'ideal' in the response. When making a donation, we need to map the value to 'sepadirectdebit'
                        merchantReference
                    } = await makePayment(state.data, paymentData);

                    if (!resultCode) actions.reject();

                    actions.resolve({
                        resultCode,
                        action,
                        order,
                        donationToken
                    });

                    sessionStorage.setItem(
                        'donation',
                        JSON.stringify({
                            donationOriginalPspReference: pspReference,
                            reference: merchantReference,
                            paymentMethod: { type },
                            donationToken
                        })
                    );
                } catch (error) {
                    console.error('## onSubmit - critical error', error);
                    actions.reject();
                }
            },

            onPaymentCompleted({ donationToken }) {
                if (donationToken) {
                    mountDonationComponent();
                }
            }
        });
        const cardElement = new Card(checkout.current, {
            _disableClickToPay: true
        });
        setElement(cardElement);
    };

    const mountDonationComponent = async () => {
        try {
            const { donationCampaigns } = await createDonationCampaigns({ currency: 'EUR' });
            const donationSession = JSON.parse(sessionStorage.getItem('donation'));
            const donationElement = new Donation(checkout.current, {
                ...donationCampaigns[0],
                onDonate: ({ data: { amount } }, component) => {
                    createDonation({ amount, donationCampaignId: donationCampaigns[0].id, ...donationSession })
                        .then(res => {
                            if (res.status !== 'refused') {
                                component.setStatus('success');
                                sessionStorage.removeItem('donation');
                            } else {
                                component.setStatus('error');
                            }
                        })
                        .catch(error => {
                            component.setStatus('error');
                            sessionStorage.removeItem('donation');
                            console.error(error);
                        });
                },
                onCancel: () => alert('Donation canceled')
            });
            setElement(donationElement);
        } catch (e) {
            console.error(e);
        }
    };

    return <Container element={element} />;
};

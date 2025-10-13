/* eslint-disable @typescript-eslint/no-misused-promises */
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { AdyenCheckout } from '../../../core/AdyenCheckout';
import Card from '../../Card/Card';
import Donation from '../Donation';
import { DonationConfiguration } from '../types';
import { AdditionalDetailsData } from '../../../core/types';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { createDonation, getDonationCampaigns, makeDetailsCall, makePayment } from '../../../../storybook/helpers/checkout-api-calls';
import { handleError, handleFinalState } from '../../../../storybook/helpers/checkout-handlers';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';

export interface DonationIntegrationExampleProps {
    contextArgs: PaymentMethodStoryProps<DonationConfiguration> & { redirectResult: string };
}

export const DonationCardIntegrationExample = ({ countryCode, amount, redirectResult }) => {
    const checkout = useRef(null);
    const [element, setElement] = useState(null);

    useEffect(() => {
        if (redirectResult) {
            void handleRedirectResult(redirectResult);
        } else {
            void createCheckout();
        }
    }, [countryCode, amount, redirectResult]);

    const createCheckout = async () => {
        checkout.current = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode,
            onSubmit: async (state, _, actions) => {
                try {
                    const paymentData = {
                        amount: { value: Number(amount), currency: 'EUR' },
                        countryCode
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
            onPaymentCompleted: (result, component) => {
                void handlePaymentCompleted(result, component);
            }
        });

        const cardElement = new Card(checkout.current, {
            _disableClickToPay: true
        });

        setElement(cardElement);
    };

    const handleRedirectResult = async (redirectResult: string) => {
        if (!redirectResult) {
            return;
        }

        checkout.current = await AdyenCheckout({
            clientKey: process.env.CLIENT_KEY,
            // @ts-ignore CLIENT_ENV has valid value
            environment: process.env.CLIENT_ENV,
            countryCode,
            onAdditionalDetails: async (state: AdditionalDetailsData, _, actions) => {
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
            onPaymentCompleted: (result, component) => {
                void handlePaymentCompleted(result, component);
            },
            onError: (error, component) => {
                handleError(error, component);
            }
        });

        checkout.current.submitDetails({ details: { redirectResult } });
    };

    const handlePaymentCompleted = async (result, component) => {
        try {
            await tryMountDonation(result);
        } catch (e) {
            console.warn(e);
            handleFinalState(result, component);
        }
    };

    const tryMountDonation = async ({ donationToken }) => {
        if (!donationToken) throw new Error('Cannot mount the Donation');

        const { donationCampaigns } = await getDonationCampaigns({ currency: 'EUR' });

        if (donationCampaigns.length === 0) throw new Error('Cannot mount the Donation, no donation campaign');

        const firstCampaign = donationCampaigns[0];
        const donationSession = JSON.parse(sessionStorage.getItem('donation'));
        // @ts-ignore ignore
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
    };

    return <ComponentContainer element={element} />;
};

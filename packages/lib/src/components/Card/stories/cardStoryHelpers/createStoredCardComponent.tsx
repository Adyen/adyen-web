import { Fragment, h } from "preact";
import { PaymentMethodStoryProps } from '../../../../../storybook/types';
import { CardConfiguration } from '../../types';
import { Checkout } from '../../../../../storybook/components/Checkout';
import Card from '../../Card';
import { ComponentContainer } from '../../../../../storybook/components/ComponentContainer';
import './storedCard.style.scss';

export const createStoredCardComponent = (args: PaymentMethodStoryProps<CardConfiguration>) => {
    const { componentConfiguration, ...checkoutConfig } = args;
    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                if (checkout.paymentMethodsResponse?.storedPaymentMethods?.length > 0) {
                    // We are only interested in card based storedPaymentMethods that support Ecommerce  - a quick way to distinguish these is if they have a brand property
                    let storedCardData;
                    let storedPM;
                    for (let i = 0; i < checkout.paymentMethodsResponse.storedPaymentMethods.length; i++) {
                        storedPM = checkout.paymentMethodsResponse.storedPaymentMethods[i];
                        if (storedPM.brand && storedPM.supportedShopperInteractions.includes('Ecommerce')) {
                            storedCardData = checkout.paymentMethodsResponse.storedPaymentMethods[i];
                            break; // exit, now we've found the first storedCard
                        }
                    }

                    if (storedCardData) {
                        const card = new Card(checkout, { ...storedCardData, ...componentConfiguration });

                        return (
                            <Fragment>
                                <div className={'stored-card-info'}>
                                    <p>
                                        <i>Stored card info:</i>
                                    </p>
                                    <div className={'info-container'}>
                                        <div>
                                            <div>Brand:</div>
                                            <img src={card.icon} alt={'stored-card-brand-icon'} />
                                        </div>
                                        <div className={'info-extra-item'}>
                                            <div>Last four digits:</div>
                                            <div className={'info-item-with-top-margin'}>{storedPM.lastFour}</div>
                                        </div>
                                        <div className={'info-extra-item'}>
                                            <div>Holder name:</div>
                                            <div className={'info-item-with-top-margin'}>{storedPM.holderName}</div>
                                        </div>
                                    </div>
                                </div>
                                <ComponentContainer element={card} />
                            </Fragment>
                        );
                    } else {
                        return <div>No stored cards found</div>;
                    }
                } else {
                    return <div>No stored payment methods found</div>;
                }
            }}
        </Checkout>
    );
};

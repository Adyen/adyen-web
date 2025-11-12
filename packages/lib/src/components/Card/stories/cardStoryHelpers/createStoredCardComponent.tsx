import { Fragment, h } from 'preact';
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
                const storedCard = checkout.paymentMethodsResponse?.storedPaymentMethods?.find(paymentMethod => paymentMethod.type === 'scheme');

                if (!storedCard) {
                    return <div>No stored cards found</div>;
                }

                const card = new Card(checkout, {
                    storedPaymentMethodId: storedCard.storedPaymentMethodId
                });

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
                                    <div className={'info-item-with-top-margin'}>{storedCard.lastFour}</div>
                                </div>
                                <div className={'info-extra-item'}>
                                    <div>Holder name:</div>
                                    <div className={'info-item-with-top-margin'}>{storedCard.holderName}</div>
                                </div>
                            </div>
                        </div>
                        <ComponentContainer element={card} />
                    </Fragment>
                );
            }}
        </Checkout>
    );
};

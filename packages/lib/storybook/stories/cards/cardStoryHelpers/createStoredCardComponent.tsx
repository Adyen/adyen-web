import { PaymentMethodStoryProps } from '../../types';
import { CardConfiguration } from '../../../../src/components/Card/types';
import { Checkout } from '../../Checkout';
import Card from '../../../../src/components/Card/Card';
import { ComponentContainer } from '../../ComponentContainer';
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
                            <>
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
                            </>
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

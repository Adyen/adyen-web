import { useEffect, useRef, useState } from 'preact/hooks';
import { createAdvancedFlowCheckout } from '../../../helpers/create-advanced-checkout';
import { createSessionsCheckout } from '../../../helpers/create-sessions-checkout';
import CustomCard from '../../../../src/components/CustomCard/CustomCard';
import { setUpUtils, createPayButton } from './customCard.utils';
import './customCard.style.scss';

export const CustomCardSeparateExpiryDate = ({ contextArgs }) => {
    const container = useRef(null);
    const checkout = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const createCheckout = async () => {
        const { useSessions, showPayButton, countryCode, shopperLocale, amount } = contextArgs;

        checkout.current = useSessions
            ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount })
            : await createAdvancedFlowCheckout({ showPayButton, countryCode, shopperLocale, amount });

        const customCard = new CustomCard(checkout.current, { ...contextArgs.componentConfiguration });

        setElement(customCard);

        // Custom card specific
        globalThis.customCard = customCard; // customCard..config & customCard.utils access the component through Storybook's globalThis
        globalThis.parent.window['customCardSeparate'] = customCard; // expose to top level window, so a user can access window.customCard

        setUpUtils(contextArgs, container);
        globalThis.payBtn = createPayButton('.secured-fields-1', customCard, 'customcard');
    };

    useEffect(() => {
        void createCheckout();
    }, [contextArgs]);

    useEffect(() => {
        if (element?.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    element.mount(container.current);
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else if (element) {
            element.mount(container.current);
        }
    }, [element]);

    return (
        <>
            {errorMessage ? (
                <div>{errorMessage}</div>
            ) : (
                <div id={'topLevelHolder'}>
                    <div
                        ref={container}
                        id="component-root"
                        className="component-wrapper secured-fields-1"
                        // @ts-ignore just hiding for better UX experience
                        style={'display:none;'}
                    >
                        <span className="pm-image">
                            <img
                                className="pm-image-1"
                                width="40"
                                src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/logos/nocard.svg"
                                alt="card"
                            />
                        </span>
                        <span className="pm-image-dual">
                            <img className="pm-image-dual-1" width="40" alt="" />
                            <img className="pm-image-dual-2" width="40" alt="" />
                        </span>
                        <div className="pm-form-label pm-form-label-pan">
                            <span className="pm-form-label__text">Card number:</span>
                            <span className="pm-input-field" data-cse="encryptedCardNumber" data-uid="adyen-checkout-encryptedCardNumber-1"></span>
                            <span className="pm-form-label__error-text">Please enter a valid credit card number</span>
                        </div>
                        <div className="pm-form-label pm-form-label--exp-month">
                            <span className="pm-form-label__text">Expiry month:</span>
                            <span className="pm-input-field" data-cse="encryptedExpiryMonth" data-uid="adyen-checkout-encryptedExpiryMonth-2"></span>
                            <span className="pm-form-label__error-text">Date error text</span>
                        </div>
                        <div className="pm-form-label pm-form-label--exp-year">
                            <span className="pm-form-label__text">Expiry year:</span>
                            <span className="pm-input-field" data-cse="encryptedExpiryYear" data-uid="adyen-checkout-encryptedExpiryYear-3"></span>
                            <span className="pm-form-label__error-text">Date error text</span>
                        </div>
                        <div className="pm-form-label pm-form-label--cvc">
                            <span className="pm-form-label__text">CVV/CVC:</span>
                            <span className="pm-input-field" data-cse="encryptedSecurityCode"></span>
                            <span className="pm-form-label__error-text">CVC Error text</span>
                        </div>
                    </div>
                    <div className="card-input__spinner__holder">
                        <div className="card-input__spinner card-input__spinner--active">
                            <div className="adyen-checkout__spinner__wrapper ">
                                <div className="adyen-checkout__spinner adyen-checkout__spinner--large"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

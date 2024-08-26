import { useEffect, useRef } from 'preact/hooks';

import { setUpUtils, createPayButton } from './cards/customCardHelpers/customCard.utils';

export const CustomCardContainer = ({ element, contextArgs }) => {
    const container = useRef(null);

    useEffect(() => {
        if (!element) return;

        element.mount(container.current);

        setUpUtils(contextArgs, container);

        globalThis.payBtn = createPayButton('.secured-fields', globalThis.customCard, 'customcard');
    }, [element]);

    return (
        <div id={'topLevelHolder'}>
            <div
                ref={container}
                id="component-root"
                className="component-wrapper secured-fields"
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
                <div className="pm-form-label">
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
    );
};

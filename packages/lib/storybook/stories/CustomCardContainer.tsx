import { useEffect, useRef, useState } from 'preact/hooks';
import { IUIElement } from '../../src/components/internal/UIElement/types';

interface IContainer {
    element: IUIElement;
}

export const Container = ({ element }: IContainer) => {
    const container = useRef(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (!element) return;

        if (element.isAvailable) {
            element
                .isAvailable()
                .then(() => {
                    element.mount(container.current);
                })
                .catch(error => {
                    setErrorMessage(error.toString());
                });
        } else {
            element.mount(container.current);
        }
    }, [element]);

    return (
        <div>
            {errorMessage ? (
                <div>{errorMessage}</div>
            ) : (
                <div ref={container} id="component-root" className="component-wrapper">
                    {/*@ts-ignore*/}
                    <div className="merchant-checkout__payment-method__details secured-fields">
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
                        <label className="pm-form-label">
                            <span className="pm-form-label__text">Card number:</span>
                            <span className="pm-input-field" data-cse="encryptedCardNumber" data-uid="adyen-checkout-encryptedCardNumber-1"></span>
                            <span className="pm-form-label__error-text">Please enter a valid credit card number</span>
                        </label>
                        <label className="pm-form-label pm-form-label--exp-month">
                            <span className="pm-form-label__text">Expiry month:</span>
                            <span className="pm-input-field" data-cse="encryptedExpiryMonth" data-uid="adyen-checkout-encryptedExpiryMonth-2"></span>
                            <span className="pm-form-label__error-text">Date error text</span>
                        </label>
                        <label className="pm-form-label pm-form-label--exp-year">
                            <span className="pm-form-label__text">Expiry year:</span>
                            <span className="pm-input-field" data-cse="encryptedExpiryYear" data-uid="adyen-checkout-encryptedExpiryYear-3"></span>
                            <span className="pm-form-label__error-text">Date error text</span>
                        </label>
                        <label className="pm-form-label pm-form-label--cvc">
                            <span className="pm-form-label__text">CVV/CVC:</span>
                            <span className="pm-input-field" data-cse="encryptedSecurityCode"></span>
                            <span className="pm-form-label__error-text">CVC Error text</span>
                        </label>
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
        </div>
    );
};

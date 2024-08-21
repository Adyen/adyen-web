import { useEffect, useRef, useState } from 'preact/hooks';
import { makePayment } from '../helpers/checkout-api-calls';
import paymentsConfig from '../config/paymentsConfig';
import getCurrency from '../utils/get-currency';

export const CustomCardContainer = ({ element, context }) => {
    const container = useRef(null);

    const createPayButton = (parent, component, attribute) => {
        const payBtn = document.createElement('button');

        payBtn.textContent = 'Pay';
        payBtn.name = 'pay';
        payBtn.classList.add('adyen-checkout__button', 'js-components-button--one-click', `js-${attribute}`);

        payBtn.addEventListener('click', e => {
            e.preventDefault();
            startPayment(component);
        });

        document.querySelector(parent).appendChild(payBtn);

        return payBtn;
    };

    const startPayment = component => {
        if (!component.isValid) return component.showValidation();

        const allow3DS2 = paymentsConfig.authenticationData.attemptAuthentication || 'never';

        makePayment(component.data, {
            amount: { value: context.args.amount, currency: getCurrency(context.args.countryCode) },
            authenticationData: {
                attemptAuthentication: allow3DS2,
                // comment out below if you want to force MDFlow
                threeDSRequestData: {
                    nativeThreeDS: 'preferred'
                }
            }
        })
            .then(result => {
                // handlePaymentResult(result, component);
            })
            .catch(error => {
                throw Error(error);
            });
    };

    useEffect(() => {
        if (!element) return;

        element.mount(container.current);

        window['payBtn'] = createPayButton('.secured-fields', window['customCard'], 'customcard');
    }, [element]);

    return (
        <div>
            <div
                ref={container}
                id="component-root"
                className="component-wrapper secured-fields"
                // @ts-ignore
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
    );
};

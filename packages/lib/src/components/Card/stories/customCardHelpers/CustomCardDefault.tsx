import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from 'preact/hooks';
import { createAdvancedFlowCheckout } from '../../../../../storybook/helpers/create-advanced-checkout';
import { createSessionsCheckout } from '../../../../../storybook/helpers/create-sessions-checkout';
import CustomCard from '../../../CustomCard/CustomCard';
import { setUpUtils, createPayButton } from './customCard.utils';
import './customCard.style.scss';

export const CustomCardDefault = ({ contextArgs }) => {
    const container = useRef(null);
    const checkout = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const createCheckout = async () => {
        const { useSessions, showPayButton = false, countryCode, shopperLocale, amount } = contextArgs;

        checkout.current = useSessions
            ? await createSessionsCheckout({ showPayButton, countryCode, shopperLocale, amount })
            : await createAdvancedFlowCheckout({
                  showPayButton,
                  countryCode,
                  shopperLocale,
                  amount
              });

        const customCard = new CustomCard(checkout.current, { ...contextArgs.componentConfiguration });

        setElement(customCard);

        // Custom card specific
        globalThis.customCard = customCard; // customCard..config & customCard.utils access the component through Storybook's globalThis
        globalThis.parent.window['customCard'] = customCard; // expose to top level window, so a user can access window.customCard

        setUpUtils(contextArgs, container);
        globalThis.payBtn = createPayButton('.secured-fields', customCard, 'customcard');
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
        <Fragment>
            {errorMessage ? (
                <div>{errorMessage}</div>
            ) : (
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
                                alt=""
                            />
                        </span>
                        <span className="pm-image-dual">
                            <img className="pm-image-dual-1" width="40" alt="" />
                            <img className="pm-image-dual-2" width="40" alt="" />
                        </span>
                        <div className="pm-form-label pm-form-label-pan">
                            <span className="pm-form-label__text">Card number</span>
                            <span className="pm-input-field" data-cse="encryptedCardNumber"></span>
                            <span className="pm-form-label__error-text">Please enter a valid credit card number</span>
                        </div>
                        <div className="pm-form-label pm-form-label--exp-date">
                            <span className="pm-form-label__text">Expiry date</span>
                            <span className="pm-input-field" data-cse="encryptedExpiryDate"></span>
                            <span className="pm-form-label__error-text">Date error text</span>
                        </div>
                        <div className="pm-form-label pm-form-label--cvc">
                            <span className="pm-form-label__text">Security code</span>
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
        </Fragment>
    );
};

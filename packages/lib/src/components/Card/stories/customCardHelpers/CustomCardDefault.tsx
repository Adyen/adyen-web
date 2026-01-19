import { Fragment, h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { createAdvancedFlowCheckout } from '../../../../../storybook/helpers/create-advanced-checkout';
import { createSessionsCheckout } from '../../../../../storybook/helpers/create-sessions-checkout';
import CustomCard from '../../../CustomCard/CustomCard';
import { setUpUtils, createPayButton } from './customCard.utils';
import Spinner from '../../../internal/Spinner';
import './customCard.style.scss';

export const CustomCardDefault = ({ contextArgs }) => {
    const container = useRef(null);
    const checkout = useRef(null);
    const [element, setElement] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [configSuccess, setConfigSuccess] = useState(false);

    const onConfigSuccess = () => {
        setConfigSuccess(true);
        globalThis.customCard.setFocusOn('encryptedCardNumber');
    };

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

        const customCard = new CustomCard(checkout.current, { ...contextArgs.componentConfiguration, onConfigSuccess });

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
            {errorMessage && <p>{errorMessage}</p>}
            <div id="topLevelHolder" data-testid="checkout-component">
                <div
                    ref={container}
                    id="component-root"
                    className="component-wrapper secured-fields"
                    style={{
                        display: configSuccess ? 'block' : 'none'
                    }}
                >
                    <Fragment>
                        <span className="pm-image">
                            <img
                                className="pm-image-1"
                                width="40"
                                src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/logos/nocard.svg"
                                alt=""
                            />
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
                    </Fragment>
                </div>
                {!configSuccess && (
                    <div data-testid="checkout-component-spinner">
                        <Spinner />
                    </div>
                )}
            </div>
        </Fragment>
    );
};

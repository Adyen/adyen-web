import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import classNames from 'classnames';
import './DisableOneClickConfirmation.scss';

const DisableOneClickConfirmation = ({ id, open, onDisable, onCancel }) => {
    const { i18n } = useCoreContext();
    return (
        <div
            id={id}
            aria-hidden={!open}
            className={classNames({
                'adyen-checkout__payment-method__disable-confirmation': true,
                'adyen-checkout__payment-method__disable-confirmation--open': open
            })}
        >
            <div className="adyen-checkout__payment-method__disable-confirmation__content">
                {i18n.get('storedPaymentMethod.disable.confirmation')}
                <div className="adyen-checkout__payment-method__disable-confirmation__buttons">
                    <button
                        type="button"
                        className={classNames(
                            'adyen-checkout__button',
                            'adyen-checkout__payment-method__disable-confirmation__button',
                            'adyen-checkout__payment-method__disable-confirmation__button--remove'
                        )}
                        disabled={!open}
                        onClick={onDisable}
                    >
                        {i18n.get('storedPaymentMethod.disable.confirmButton')}
                    </button>
                    <button
                        type="button"
                        className={classNames(
                            'adyen-checkout__button',
                            'adyen-checkout__payment-method__disable-confirmation__button',
                            'adyen-checkout__payment-method__disable-confirmation__button--cancel'
                        )}
                        disabled={!open}
                        onClick={onCancel}
                    >
                        {i18n.get('storedPaymentMethod.disable.cancelButton')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisableOneClickConfirmation;

import { h } from 'preact';
import classNames from 'classnames';

import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Button from '../../../internal/Button';
import { stopPropagationForActionKeys } from '../../../internal/Button/stopPropagationForActionKeys';
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
                    <Button
                        classNameModifiers={['disable-confirmation', 'disable-confirmation-remove']}
                        disabled={!open}
                        onClick={onDisable}
                        onKeyDown={stopPropagationForActionKeys}
                        label={i18n.get('storedPaymentMethod.disable.confirmButton')}
                    />
                    <Button
                        classNameModifiers={['disable-confirmation', 'disable-confirmation-cancel']}
                        disabled={!open}
                        onClick={onCancel}
                        onKeyDown={stopPropagationForActionKeys}
                        label={i18n.get('storedPaymentMethod.disable.cancelButton')}
                    />
                </div>
            </div>
        </div>
    );
};

export default DisableOneClickConfirmation;

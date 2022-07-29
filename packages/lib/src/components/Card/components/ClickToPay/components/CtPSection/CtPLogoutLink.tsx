import { h } from 'preact';
import useClickToPayContext from '../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { CtpState } from '../../services/ClickToPayService';
import classnames from 'classnames';
import './CtPLogoutLink.scss';

const CtPLogoutLink = (): h.JSX.Element => {
    const { ctpState, logoutShopper, status } = useClickToPayContext();
    const { i18n } = useCoreContext();

    if ([CtpState.Ready, CtpState.OneTimePassword].includes(ctpState) === false) {
        return;
    }

    return (
        <span
            role="button"
            tabIndex={0}
            className={classnames('adyen-checkout-ctp__section-logout-button', {
                'adyen-checkout-ctp__section-logout-button--disabled': status === 'loading'
            })}
            onClick={logoutShopper}
        >
            {ctpState === CtpState.Ready ? i18n.get('ctp.logout.notYouCards') : i18n.get('ctp.logout.notYou')}
        </span>
    );
};

export default CtPLogoutLink;

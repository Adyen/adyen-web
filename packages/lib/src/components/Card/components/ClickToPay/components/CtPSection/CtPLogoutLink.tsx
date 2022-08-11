import { h } from 'preact';
import useClickToPayContext from '../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { CtpState } from '../../services/ClickToPayService';
import classnames from 'classnames';
import './CtPLogoutLink.scss';

const CtPLogoutLink = (): h.JSX.Element => {
    const { ctpState, logoutShopper, status, cards } = useClickToPayContext();
    const { i18n } = useCoreContext();

    if ([CtpState.Ready, CtpState.OneTimePassword].includes(ctpState) === false) {
        return null;
    }

    if (CtpState.Ready === ctpState && cards.length === 0) {
        return null;
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

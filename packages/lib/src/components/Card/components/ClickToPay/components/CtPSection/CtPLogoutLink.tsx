import { h } from 'preact';
import useClickToPayContext from '../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { CtpState } from '../../services/ClickToPayService';
import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import './CtPLogoutLink.scss';

const CtPLogoutLink = (): h.JSX.Element => {
    const { ctpState, logoutShopper, status, cards } = useClickToPayContext();
    const { i18n } = useCoreContext();

    if ([CtpState.Ready, CtpState.OneTimePassword].includes(ctpState) === false) {
        return null;
    }

    const label = useMemo(() => {
        if (ctpState === CtpState.Ready && cards.length !== 0) return i18n.get('ctp.logout.notYouCards');
        else return i18n.get('ctp.logout.notYou');
    }, [i18n, ctpState]);

    return (
        <span
            role="button"
            tabIndex={0}
            className={classnames('adyen-checkout-ctp__section-logout-button', {
                'adyen-checkout-ctp__section-logout-button--disabled': status === 'loading'
            })}
            onClick={logoutShopper}
        >
            {label}
        </span>
    );
};

export default CtPLogoutLink;

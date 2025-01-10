import { h } from 'preact';
import useClickToPayContext from '../../context/useClickToPayContext';
import { CtpState } from '../../services/ClickToPayService';
import classnames from 'classnames';
import { useMemo } from 'preact/hooks';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import './CtPLogoutLink.scss';
import Button from '../../../Button';

const CtPLogoutLink = () => {
    const { ctpState, logoutShopper, status, cards } = useClickToPayContext();
    const { i18n } = useCoreContext();

    if ([CtpState.Ready, CtpState.OneTimePassword].includes(ctpState) === false) {
        return null;
    }

    const label = useMemo(() => {
        if (ctpState === CtpState.Ready && cards.length > 1) return i18n.get('ctp.logout.notYourCards');
        if (ctpState === CtpState.Ready && cards.length === 1) return i18n.get('ctp.logout.notYourCard');
        if (ctpState === CtpState.Ready && cards.length === 0) return i18n.get('ctp.logout.notYourProfile');
        return i18n.get('ctp.logout.notYou');
    }, [i18n, ctpState]);

    return (
        <Button
            classNameModifiers={[
                classnames('section-logout-button', {
                    'section-logout-button--disabled': status === 'loading'
                })
            ]}
            disabled={status === 'loading'}
            onClick={logoutShopper}
            variant="link"
            inline={true}
        >
            {label}
        </Button>
    );
};

export default CtPLogoutLink;

import { Fragment, h } from 'preact';
import { CtpState } from '../../services/ClickToPayService';
import useClickToPayContext from './context/useClickToPayContext';
import CtPOneTimePassword from './components/CtPOneTimePassword';
import CtPCardsList from './components/CtPCardsList';
import CtPSection from './components/CtPSection';
import ContentSeparator from '../../../internal/ContentSeparator';
import { useEffect } from 'preact/hooks';

/**
 * TODO:
 * Scenarios to think:
 * - CtP Card is selected , then shopper focus on credit card field and type something. What happens?
 * - Credit card data is entered by shopper. Then shopper goes and clicks on CtP available card. What happens?
 * - When getSrcProfile returns multiple profiles? Is it when there are multiple schemas?
 */

const ClickToPayComponent = () => {
    const { ctpState, startIdentityValidation } = useClickToPayContext();

    useEffect(() => {
        if (ctpState === CtpState.ShopperIdentified) startIdentityValidation();
    }, [ctpState]);

    if (ctpState === CtpState.NotAvailable) {
        return null;
    }

    return (
        <Fragment>
            <CtPSection isLoading={[CtpState.Loading, CtpState.ShopperIdentified].includes(ctpState)}>
                {ctpState === CtpState.OneTimePassword && <CtPOneTimePassword />}
                {ctpState === CtpState.Ready && <CtPCardsList />}
            </CtPSection>
            <ContentSeparator classNames={['adyen-checkout-ctp__separator']} label="Or enter card details manually" />
        </Fragment>
    );
};

export default ClickToPayComponent;

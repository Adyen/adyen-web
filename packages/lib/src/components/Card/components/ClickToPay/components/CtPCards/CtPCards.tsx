import { Fragment, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPSingleCard from './CtPSingleCard/CtPSingleCard';
import getImage from '../../../../../../utils/get-image';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import PayButton from '../../../../../internal/PayButton';
import { amountLabel } from '../../../../../internal/PayButton/utils';
import CtPCardsList from './CtPCardsList';
import ShopperCard from '../../models/ShopperCard';
import CtPEmptyCardsList from './CtPEmptyCardsList';
import './CtPCards.scss';
import isMobile from '../../../../../../utils/isMobile';
import SrciError from '../../services/sdks/SrciError';
import Language from '../../../../../../language';
import CtPSection from '../CtPSection';
import { CTP_IFRAME_NAME } from '../../services/utils';
import Iframe from '../../../../../internal/IFrame';

type CtPCardsProps = {
    onDisplayCardComponent?(): void;
};

function getErrorLabel(errorCode: string, i18n: Language): string {
    if (!errorCode) return null;

    const errorLabel = i18n.get(`ctp.errors.${errorCode}`);
    if (errorLabel.includes('ctp.errors')) return i18n.get(`ctp.errors.UNKNOWN_ERROR`);
    return errorLabel;
}

const CtPCards = ({ onDisplayCardComponent }: CtPCardsProps) => {
    const { loadingContext, i18n } = useCoreContext();
    const { amount, cards, checkout, isCtpPrimaryPaymentMethod, status, onSubmit, onSetStatus, onError } = useClickToPayContext();
    const [checkoutCard, setCheckoutCard] = useState<ShopperCard>(cards[0]);
    const [errorCode, setErrorCode] = useState<string>(null);
    const isEveryCardExpired = cards.every(card => card.isExpired);

    useEffect(() => {
        if (cards.length === 0 || isEveryCardExpired) {
            onDisplayCardComponent?.();
        }
    }, [onDisplayCardComponent, isEveryCardExpired, cards]);

    const doCheckout = useCallback(async () => {
        if (!checkoutCard) return;

        try {
            setErrorCode(null);
            onSetStatus('loading');
            const payload = await checkout(checkoutCard);
            onSubmit(payload);
        } catch (error) {
            if (error instanceof SrciError) setErrorCode(error?.reason);
            onError(error);
        }
    }, [checkout, checkoutCard]);

    const handleOnChangeCard = useCallback((card: ShopperCard) => {
        setCheckoutCard(card);
    }, []);

    if (cards.length === 0) {
        return <CtPEmptyCardsList />;
    }

    const displayNetworkDcf = status === 'loading' && checkoutCard.isDcfPopupEmbedded;
    const displayCardCheckoutView = status !== 'loading' || !displayNetworkDcf;

    return (
        <Fragment>
            <Iframe name={CTP_IFRAME_NAME} height="600" width="100%" classNameModifiers={[displayNetworkDcf ? '' : 'hidden']} />

            {displayCardCheckoutView && (
                <Fragment>
                    <CtPSection.Title>{i18n.get('ctp.cards.title')}</CtPSection.Title>
                    <CtPSection.Text>{i18n.get('ctp.cards.subtitle')}</CtPSection.Text>

                    {cards.length === 1 ? (
                        <CtPSingleCard card={cards[0]} errorMessage={getErrorLabel(errorCode, i18n)} />
                    ) : (
                        <CtPCardsList cards={cards} onChangeCard={handleOnChangeCard} errorMessage={getErrorLabel(errorCode, i18n)} />
                    )}

                    <PayButton
                        disabled={isEveryCardExpired}
                        amount={amount}
                        label={
                            !isMobile() &&
                            i18n.get('payButton.with', {
                                values: { value: amountLabel(i18n, amount), maskedData: `•••• ${checkoutCard?.panLastFour}` }
                            })
                        }
                        status={status}
                        variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                        icon={getImage({ loadingContext: loadingContext, imageFolder: 'components/' })(
                            isCtpPrimaryPaymentMethod ? 'lock' : 'lock_black'
                        )}
                        onClick={doCheckout}
                    />
                </Fragment>
            )}
        </Fragment>
    );
};

export default CtPCards;

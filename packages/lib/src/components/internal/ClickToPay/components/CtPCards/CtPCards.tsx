import { Fragment, h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import useClickToPayContext from '../../context/useClickToPayContext';
import CtPSingleCard from './CtPSingleCard/CtPSingleCard';
import PayButton from '../../../PayButton';
import { amountLabel } from '../../../PayButton/utils';
import CtPCardsList from './CtPCardsList';
import ShopperCard from '../../models/ShopperCard';
import SrciError from '../../services/sdks/SrciError';
import CtPSection from '../CtPSection';
import { CTP_IFRAME_NAME } from '../../services/utils';
import Iframe from '../../../../internal/IFrame';
import useImage from '../../../../../core/Context/useImage';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import isMobile from '../../../../../utils/isMobile';
import Language from '../../../../../language';
import { PaymentAmount } from '../../../../../types/global-types';
import './CtPCards.scss';

type CtPCardsProps = {
    onDisplayCardComponent?(): void;
};

function getErrorLabel(errorCode: string, i18n: Language): string {
    if (!errorCode) return null;

    const errorLabel = i18n.get(`ctp.errors.${errorCode}`);
    if (errorLabel.includes('ctp.errors')) return i18n.get(`ctp.errors.UNKNOWN_ERROR`);
    return errorLabel;
}

function getPayButtonLabel(i18n: Language, amount: PaymentAmount, checkoutCard?: ShopperCard): string | null {
    if (!checkoutCard) return i18n.get('payButton');
    if (!isMobile())
        return i18n.get('payButton.with', {
            values: { value: amountLabel(i18n, amount), maskedData: `•••• ${checkoutCard?.panLastFour}` }
        });
    return null;
}

const CtPCards = ({ onDisplayCardComponent }: CtPCardsProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const { amount, cards, checkout, isCtpPrimaryPaymentMethod, status, onSubmit, onSetStatus, onError } = useClickToPayContext();
    const [checkoutCard, setCheckoutCard] = useState<ShopperCard | undefined>(cards.find(card => !card.isExpired) || cards[0]);
    const [errorCode, setErrorCode] = useState<string>(null);
    const isEveryCardExpired = cards.every(card => card.isExpired);
    const [isShopperCheckingOutWithCtp, setIsShopperCheckingOutWithCtp] = useState<boolean>(false);

    useEffect(() => {
        if (cards.length === 0 || isEveryCardExpired) {
            onDisplayCardComponent?.();
        }
    }, [onDisplayCardComponent, isEveryCardExpired, cards]);

    const doCheckout = useCallback(async () => {
        if (!checkoutCard) return;

        try {
            setIsShopperCheckingOutWithCtp(true);
            setErrorCode(null);
            onSetStatus('loading');
            const payload = await checkout(checkoutCard);
            onSubmit(payload);
        } catch (error) {
            if (error instanceof SrciError) {
                setErrorCode(error?.reason);
                console.warn(`CtP - Checkout: Reason: ${error?.reason} / Source: ${error?.source} / Scheme: ${error?.scheme}`);
            }
            setIsShopperCheckingOutWithCtp(false);
            onError(error);
        }
    }, [checkout, checkoutCard]);

    const handleOnChangeCard = useCallback((card: ShopperCard) => {
        setCheckoutCard(card);
    }, []);

    /**
     * If shopper submits the payment using the default Card component while CtP is rendered, the status here will be updated
     * and that can potentially display an iframe.
     *
     * Therefore, we use the flag 'isShopperCheckingOutWithCtp' to flag that the iframe should be displayed only in case the
     * Shopper is checking out with Click to Pay.
     */
    const displayNetworkDcf = isShopperCheckingOutWithCtp && status === 'loading' && checkoutCard?.isDcfPopupEmbedded;
    const displayCardCheckoutView = status !== 'loading' || !displayNetworkDcf;

    return (
        <Fragment>
            <Iframe name={CTP_IFRAME_NAME} height="380" width="100%" classNameModifiers={[displayNetworkDcf ? '' : 'hidden']} />

            {displayCardCheckoutView && (
                <Fragment>
                    <CtPSection.Title>{i18n.get('ctp.cards.title')}</CtPSection.Title>
                    <CtPSection.Text>{i18n.get('ctp.cards.subtitle')}</CtPSection.Text>

                    {cards.length === 0 && <div className="adyen-checkout-ctp__empty-cards">{i18n.get('ctp.emptyProfile.message')}</div>}
                    {cards.length === 1 && <CtPSingleCard card={cards[0]} errorMessage={getErrorLabel(errorCode, i18n)} />}
                    {cards.length > 1 && (
                        <CtPCardsList
                            cardSelected={checkoutCard}
                            cards={cards}
                            onChangeCard={handleOnChangeCard}
                            errorMessage={getErrorLabel(errorCode, i18n)}
                        />
                    )}

                    <PayButton
                        disabled={isEveryCardExpired}
                        amount={amount}
                        label={getPayButtonLabel(i18n, amount, checkoutCard)}
                        status={status}
                        variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                        icon={cards.length !== 0 && getImage({ imageFolder: 'components/' })(isCtpPrimaryPaymentMethod ? 'lock' : 'lock_black')}
                        onClick={doCheckout}
                    />
                </Fragment>
            )}
        </Fragment>
    );
};

export default CtPCards;

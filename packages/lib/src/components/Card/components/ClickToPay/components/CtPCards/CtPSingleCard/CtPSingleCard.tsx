import { Fragment, h } from 'preact';
import classnames from 'classnames';
import Img from '../../../../../../internal/Img';
import ShopperCard from '../../../models/ShopperCard';

import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPSingleCard.scss';

type CtPSingleCardProps = {
    card: ShopperCard;
    errorMessage?: string;
};

const CtPSingleCard = ({ card,errorMessage }: CtPSingleCardProps) => {
    const { loadingContext, i18n, resources } = useCoreContext();
    const cardImage = card.artUri || resources.getImage({ loadingContext })(card.scheme);

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__card-list-single-card">
                <Img src={cardImage} height={24} className={'adyen-checkout-ctp__card-image'} />

                <span className={classnames({ 'adyen-checkout-ctp__card-list-single-card-expired': card.isExpired })}>
                    {card.title} {`•••• ${card.panLastFour}`}
                </span>

                {card.isExpired && <span className="adyen-checkout-ctp__expired-label">{i18n.get('ctp.cards.expiredCard')}</span>}
            </div>

            {errorMessage && <div className="adyen-checkout__error-text">{errorMessage}</div>}
        </Fragment>
    );
};

export default CtPSingleCard;

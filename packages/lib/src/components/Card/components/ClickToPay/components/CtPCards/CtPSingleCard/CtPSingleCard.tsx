import { h } from 'preact';
import classnames from 'classnames';
import Img from '../../../../../../internal/Img';
import ShopperCard from '../../../models/ShopperCard';
import getImage from '../../../../../../../utils/get-image';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPSingleCard.scss';

type CtPSingleCardProps = {
    card: ShopperCard;
};

const CtPSingleCard = ({ card }: CtPSingleCardProps) => {
    const { loadingContext, i18n } = useCoreContext();
    const cardImage = card.artUri || getImage({ loadingContext })(card.scheme);

    return (
        <div className="adyen-checkout-ctp__card-list-single-card">
            <Img src={cardImage} height={24} className={'adyen-checkout-ctp__card-image'} />

            <span className={classnames({ 'adyen-checkout-ctp__card-list-single-card-expired': card.isExpired })}>
                {card.title} {`•••• ${card.panLastFour}`}
            </span>

            {card.isExpired && <span className="adyen-checkout-ctp__expired-label">{i18n.get('ctp.cards.expiredCard')}</span>}
        </div>
    );
};

export default CtPSingleCard;

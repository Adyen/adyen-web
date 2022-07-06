import { h } from 'preact';
import { ShopperCard } from '../../../services/types';
import './CtPSingleCard.scss';
import Img from '../../../../../../internal/Img';

type CtPSingleCardProps = {
    card: ShopperCard;
};

const CtPSingleCard = ({ card }: CtPSingleCardProps) => {
    return (
        <div className="adyen-checkout-ctp__card-list-single-card">
            <Img src={card.artUri} height={30} className={'adyen-checkout-ctp__card-image'} />
            <span>
                {card.cardTitle} {`•••• ${card.panLastFour}`}
            </span>
        </div>
    );
};

export default CtPSingleCard;

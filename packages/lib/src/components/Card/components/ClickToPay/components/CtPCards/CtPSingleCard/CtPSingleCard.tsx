import { h } from 'preact';
import Img from '../../../../../../internal/Img';
import ShopperCard from '../../../models/ShopperCard';
import './CtPSingleCard.scss';

type CtPSingleCardProps = {
    card: ShopperCard;
};

const CtPSingleCard = ({ card }: CtPSingleCardProps) => {
    return (
        <div className="adyen-checkout-ctp__card-list-single-card">
            <Img src={card.artUri} height={24} className={'adyen-checkout-ctp__card-image'} />
            <span>
                {card.title} {`•••• ${card.panLastFour}`}
            </span>
        </div>
    );
};

export default CtPSingleCard;

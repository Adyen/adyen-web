import { h } from 'preact';
import Img from '../../../../../../internal/Img';
import ShopperCard from '../../../models/ShopperCard';
import getImage from '../../../../../../../utils/get-image';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPSingleCard.scss';

type CtPSingleCardProps = {
    card: ShopperCard;
};

const CtPSingleCard = ({ card }: CtPSingleCardProps) => {
    const { loadingContext } = useCoreContext();
    const cardImage = card.artUri || getImage({ loadingContext })(card.scheme);

    return (
        <div className="adyen-checkout-ctp__card-list-single-card">
            <Img src={cardImage} height={24} className={'adyen-checkout-ctp__card-image'} />
            <span>
                {card.title} {`•••• ${card.panLastFour}`}
            </span>
        </div>
    );
};

export default CtPSingleCard;

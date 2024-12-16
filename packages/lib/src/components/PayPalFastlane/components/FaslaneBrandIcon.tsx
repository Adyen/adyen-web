import { h } from 'preact';
import useImage from '../../../core/Context/useImage';
import Img from '../../internal/Img';
import { getFullBrandName } from '../../Card/components/CardInput/utils';

interface FastlaneBrandIconProps {
    brand: string;
}

const FastlaneBrandIcon = ({ brand }: FastlaneBrandIconProps) => {
    const getImage = useImage();

    return (
        <span className="adyen-checkout-fastlane__card-brand--wrapper">
            <Img src={getImage()(brand)} alt={getFullBrandName(brand)} />
        </span>
    );
};

export default FastlaneBrandIcon;

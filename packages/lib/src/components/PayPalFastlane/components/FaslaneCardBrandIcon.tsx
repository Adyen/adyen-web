import { h } from 'preact';
import useImage from '../../../core/Context/useImage';
import Img from '../../internal/Img';
import { getFullBrandName } from '../../Card/components/CardInput/utils';

interface FastlaneCardBrandIconProps {
    brand: string;
}

function mapFastlaneCardBrandToAdyenBrand(brand: string) {
    return brand === 'mastercard' ? 'mc' : brand;
}

const FastlaneCardBrandIcon = ({ brand }: FastlaneCardBrandIconProps) => {
    const getImage = useImage();
    const mappedBrand = mapFastlaneCardBrandToAdyenBrand(brand);

    return (
        <span className="adyen-checkout-fastlane__card-brand--wrapper">
            <Img src={getImage()(mappedBrand)} alt={getFullBrandName(mappedBrand)} />
        </span>
    );
};

export default FastlaneCardBrandIcon;

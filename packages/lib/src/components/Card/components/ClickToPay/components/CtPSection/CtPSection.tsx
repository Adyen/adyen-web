import { h } from 'preact';
// import useCoreContext from '../../../core/Context/useCoreContext';
import './CtPSection.scss';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import getImage from '../../../../../../utils/get-image';
import Img from '../../../../../internal/Img';
import Spinner from '../../../../../internal/Spinner';

const brands = ['mc', 'visa', 'amex', 'discover'];

interface CtPSectionProps {
    children?: any;
    isLoading?: boolean;
}

const CtPSection = ({ isLoading = false, children }: CtPSectionProps) => {
    const { loadingContext } = useCoreContext();

    const url = getImage({ loadingContext })('visacheckout');

    return (
        <div className="adyen-checkout-ctp__section">
            <div className="adyen-checkout-ctp__section-header">
                <Img className="adyen-checkout-ctp__section-header-logo" src={url} alt={url} />
                <span className="adyen-checkout-ctp__section-header-divider" />
                {brands.map(brand => (
                    <Img key={brand} className="adyen-checkout-ctp__section-header-scheme" src={getImage({ loadingContext })(brand)} alt={brand} />
                ))}
            </div>

            {isLoading ? (
                <div className="adyen-checkout-ctp__section-loader">
                    <Spinner />
                </div>
            ) : (
                children
            )}
        </div>
    );
};

export default CtPSection;

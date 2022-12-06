import { h } from 'preact';
import CtPLogoutLink from './CtPLogoutLink';
import { CtPBrand } from '../CtPBrand';
import './CtPSection.scss';

interface CtPSectionProps {
    children?: h.JSX.Element[];
}

const CtPSection = ({ children }: CtPSectionProps): h.JSX.Element => {
    return (
        <div className="adyen-checkout-ctp__section">
            <div className="adyen-checkout-ctp__section-header">
                <CtPBrand />
                <CtPLogoutLink />
            </div>

            {children}
        </div>
    );
};

export default CtPSection;

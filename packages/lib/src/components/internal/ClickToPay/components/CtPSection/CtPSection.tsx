import { h } from 'preact';
import classnames from 'classnames';
import CtPLogoutLink from './CtPLogoutLink';
import { CtPBrand } from '../CtPBrand';
import useClickToPayContext from '../../context/useClickToPayContext';
import './CtPSection.scss';

interface CtPSectionProps {
    children?: h.JSX.Element[];
}

const CtPSection = ({ children }: CtPSectionProps): h.JSX.Element => {
    const { isStandaloneComponent } = useClickToPayContext();

    return (
        <div className={classnames('adyen-checkout-ctp__section', { 'adyen-checkout-ctp__section--standalone': isStandaloneComponent })}>
            <div className="adyen-checkout-ctp__section-brand">
                <CtPBrand />
                <CtPLogoutLink />
            </div>

            {children}
        </div>
    );
};

const Title = ({ endAdornment, children }: { endAdornment?; children }) => (
    <div className="adyen-checkout-ctp__section-header">
        <h1 className="adyen-checkout-ctp__section-header-title">{children}</h1>
        {endAdornment && <span className="adyen-checkout-ctp__section-header-adornment">{endAdornment}</span>}
    </div>
);
const Text = ({ children }: { children }) => <p className="adyen-checkout-ctp__section-text">{children}</p>;

CtPSection.Title = Title;
CtPSection.Text = Text;

export default CtPSection;

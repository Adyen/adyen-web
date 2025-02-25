import { h } from 'preact';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import './AwaitLogoContainer.scss';

// todo: add logos after uploaded to cdn
const LOGO_MAPPING = {
    openFinance: { name: 'pix', alt: 'Open Finance' },
    arrowDown: { name: '', alt: '' },
    bank: { name: '', alt: '' }
};
function AwaitLogoContainer() {
    const { resources } = useCoreContext();

    return (
        <div className={'adyen-checkout-await-logo-container'}>
            <img
                src={resources.getImage()(LOGO_MAPPING.openFinance.name)}
                alt={LOGO_MAPPING.openFinance.alt}
                className="adyen-checkout__await__brand-logo"
            />
        </div>
    );
}

export default AwaitLogoContainer;

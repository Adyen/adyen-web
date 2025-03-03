import { h } from 'preact';
import './AwaitLogoContainer.scss';
import useImage from '../../../../../core/Context/useImage';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';

// todo: add logos after uploaded to cdn
const LOGO_MAPPING = {
    openFinance: { name: 'pix', altI18nKey: 'paybybankpix.await.logoAlt.openFinance' },
    arrowDown: { name: '', alt: '' },
    bank: { name: '', alt: '' }
};
function AwaitLogoContainer() {
    const getImage = useImage();
    const { i18n } = useCoreContext();

    return (
        <div className={'adyen-checkout-await-logo-container'}>
            <img
                src={getImage()(LOGO_MAPPING.openFinance.name)}
                alt={i18n.get(LOGO_MAPPING.openFinance.altI18nKey)}
                className="adyen-checkout__await__brand-logo"
            />
        </div>
    );
}

export default AwaitLogoContainer;

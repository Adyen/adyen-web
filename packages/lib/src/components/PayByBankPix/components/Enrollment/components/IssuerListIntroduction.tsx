import { h } from 'preact';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import './IssuerListIntroduction.scss';

// todo: add logos after uploaded to cdn
const LOGO = {
    name: 'pix',
    alt: ''
};
function IssuerListIntroduction() {
    const { i18n, resources } = useCoreContext();

    return (
        <div className={'adyen-checkout-issuer-list-introduction'}>
            <div className="adyen-checkout-issuer-list-introduction-logo-container">
                <img src={resources.getImage()(LOGO.name)} alt={LOGO.alt} className="adyen-checkout__await__brand-logo" />
                <p className="adyen-checkout-issuer-list-introduction-logo-container__title">
                    {i18n.get('paybybankpix.issuerList.introduction.logo.title')}
                </p>
                <p className="adyen-checkout-issuer-list-introduction-logo-container__content">
                    {i18n.get('paybybankpix.issuerList.introduction.logo.content')}
                </p>
            </div>
            <div className="adyen-checkout-issuer-list-introduction-text-container">
                <p className="adyen-checkout-issuer-list-introduction-text-container__title">
                    {i18n.get('paybybankpix.issuerList.introduction.title')}
                </p>
                <p className="adyen-checkout-issuer-list-introduction-text-container__content">
                    {i18n.get('paybybankpix.issuerList.introduction.content1')}
                </p>
                <p className="adyen-checkout-issuer-list-introduction-text-container__content">
                    {i18n.get('paybybankpix.issuerList.introduction.content2')}
                </p>
            </div>
        </div>
    );
}

export default IssuerListIntroduction;

import { h } from 'preact';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import './IssuerListIntroduction.scss';
import useImage from '../../../../../core/Context/useImage';

// todo: add logos after uploaded to cdn
const LOGO = {
    name: 'open-finance',
    altI18nKey: ''
};
function IssuerListIntroduction() {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <div className={'adyen-checkout-issuer-list-introduction'}>
            <div className="adyen-checkout-issuer-list-introduction-logo-container">
                <img
                    src={getImage()(LOGO.name)}
                    alt={i18n.get(LOGO.altI18nKey)}
                    className="adyen-checkout-issuer-list-introduction-logo-container__logo"
                />
                <p className="adyen-checkout-issuer-list-introduction-logo-container__title">
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

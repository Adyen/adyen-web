import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import './ContentSeparator.scss';

function ContentSeparator() {
    const { i18n } = useCoreContext();
    return <div className="adyen-checkout__field--issuer-list-separator">{i18n.get('qrCodeOrApp')}</div>;
}

export default ContentSeparator;

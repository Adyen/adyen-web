import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import './ContentSeparator.scss';

interface ContentSeparatorProps {
    label?: string;
}

function ContentSeparator({ label = 'qrCodeOrApp' }: ContentSeparatorProps) {
    const { i18n } = useCoreContext();
    return <div className="adyen-checkout__field--issuer-list-separator">{i18n.get(label)}</div>;
}

export default ContentSeparator;

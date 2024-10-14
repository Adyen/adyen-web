import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import ContentSeparator from '../../internal/ContentSeparator';
import './PayNowInstructions.scss';

/**
 * Instructions for PayNow are rendered only on mobile view.
 */
const PayNowInstructions = () => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout-paynow__instructions">
            <ContentSeparator />
            <p>{i18n.get('paynow.scanQrCode')}</p>
        </div>
    );
};

export { PayNowInstructions };

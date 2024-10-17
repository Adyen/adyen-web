import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import ContentSeparator from '../../internal/ContentSeparator';
import './PayNowInstructions.scss';
import { useIsMobile } from '../../../utils/useIsMobile';

const PayNowInstructions = () => {
    const { i18n } = useCoreContext();
    const { isMobileScreenSize } = useIsMobile();

    if (!isMobileScreenSize) return;

    return (
        <div className="adyen-checkout-paynow__instructions">
            <ContentSeparator />
            <p>{i18n.get('paynow.scanQrCode')}</p>
        </div>
    );
};

export { PayNowInstructions };

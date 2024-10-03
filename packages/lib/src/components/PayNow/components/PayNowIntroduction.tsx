import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import ContentSeparator from '../../internal/ContentSeparator';
import './PayNowIntroduction.scss';

const PayNowIntroduction = () => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout-paynow__introduction">
            {i18n.get('paynow.scanQrCode')}

            <div className="adyen-checkout-paynow__introduction--mobile-only" data-testid="paynow-mobile-instructions">
                <ContentSeparator />
                <div>1. {i18n.get('paynow.mobileViewInstruction.step1')}</div>
                <div>2. {i18n.get('paynow.mobileViewInstruction.step2')}</div>
                <div>3. {i18n.get('paynow.mobileViewInstruction.step3')}</div>
                <div>4. {i18n.get('paynow.mobileViewInstruction.step4')}</div>
                <div>5. {i18n.get('paynow.mobileViewInstruction.step5')}</div>
            </div>
        </div>
    );
};

export { PayNowIntroduction };

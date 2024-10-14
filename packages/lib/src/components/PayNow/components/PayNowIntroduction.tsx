import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Timeline from '../../internal/Timeline';
import './PayNowIntroduction.scss';

const PayNowIntroduction = () => {
    const { i18n } = useCoreContext();

    const instructions = [
        i18n.get('paynow.mobileViewInstruction.step1'),
        i18n.get('paynow.mobileViewInstruction.step2'),
        i18n.get('paynow.mobileViewInstruction.step3'),
        i18n.get('paynow.mobileViewInstruction.step4'),
        i18n.get('paynow.mobileViewInstruction.step5')
    ];

    return (
        <div className="adyen-checkout-paynow__introduction">
            <div className="adyen-checkout-paynow__introduction--desktop">{i18n.get('paynow.scanQrCode')}</div>

            <div className="adyen-checkout-paynow__introduction--mobile" data-testid="paynow-mobile-instructions">
                <Timeline instructions={instructions} />
            </div>
        </div>
    );
};

export { PayNowIntroduction };

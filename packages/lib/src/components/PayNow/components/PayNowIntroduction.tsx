import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import './PayNowIntroduction.scss';
import { TimelineWrapper, Timeline } from '../../internal/Timeline';
import { useIsMobile } from '../../../utils/useIsMobile';

const PayNowIntroduction = () => {
    const { i18n } = useCoreContext();
    const { isMobileScreenSize } = useIsMobile();

    if (isMobileScreenSize) {
        const instructions = [
            i18n.get('paynow.mobileViewInstruction.step1'),
            i18n.get('paynow.mobileViewInstruction.step2'),
            i18n.get('paynow.mobileViewInstruction.step3'),
            i18n.get('paynow.mobileViewInstruction.step4'),
            i18n.get('paynow.mobileViewInstruction.step5')
        ];

        return (
            <div className="adyen-checkout-paynow__introduction">
                <TimelineWrapper>
                    <Timeline instructions={instructions} />
                </TimelineWrapper>
            </div>
        );
    }

    return <div className="adyen-checkout-paynow__introduction"> {i18n.get('paynow.scanQrCode')} </div>;
};

export { PayNowIntroduction };

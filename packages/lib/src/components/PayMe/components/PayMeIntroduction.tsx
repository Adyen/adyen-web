import { useCoreContext } from '../../../core/Context/CoreProvider';
import { useIsMobile } from '../../../utils/useIsMobile';
import { Timeline, TimelineWrapper } from '../../internal/Timeline';
import { Fragment, h } from 'preact';

const PayMeIntroduction = () => {
    const { i18n } = useCoreContext();
    const { isMobileScreenSize } = useIsMobile();

    const instructions = i18n.get('payme.instructions.steps').split('%@');

    return isMobileScreenSize ? (
        <TimelineWrapper>
            <Timeline instructions={instructions} />
        </TimelineWrapper>
    ) : (
        <Fragment>{i18n.get('payme.scanQrCode')}</Fragment>
    );
};

export { PayMeIntroduction };

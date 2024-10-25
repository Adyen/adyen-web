import { useIsMobile } from '../../../utils/useIsMobile';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { Timeline, TimelineWrapper } from '../../internal/Timeline';
import { h } from 'preact';

const PayMeInstructions = () => {
    const { i18n } = useCoreContext();
    const { isMobileScreenSize } = useIsMobile();

    if (isMobileScreenSize) {
        return null;
    }

    const instructions = i18n.get('payme.instructions.steps').split('%@');

    return (
        <TimelineWrapper>
            <Timeline instructions={instructions} />
        </TimelineWrapper>
    );
};

export { PayMeInstructions };

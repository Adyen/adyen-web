import { useCoreContext } from '../../../core/Context/CoreProvider';
import { Timeline, TimelineWrapper } from '../../internal/Timeline';
import { h } from 'preact';

export const PayToInstructions = () => {
    const { i18n } = useCoreContext();

    const instructions = i18n.get('payto.instructions.steps').split('@');

    return (
        <TimelineWrapper>
            <Timeline instructions={instructions} />
        </TimelineWrapper>
    );
};

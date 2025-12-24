import { h } from 'preact';

import { Timeline, TimelineWrapper } from '../../internal/Timeline';
import { useCoreContext } from '../../../core/Context/CoreProvider';

export const IrisQrCodeInstructions = () => {
    const { i18n } = useCoreContext();
    return (
        <TimelineWrapper>
            <Timeline
                instructions={[
                    i18n.get('iris.instructions.payment.step1'),
                    i18n.get('iris.instructions.payment.step2'),
                    i18n.get('iris.instructions.payment.step3')
                ]}
            />
        </TimelineWrapper>
    );
};

import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { Timeline, TimelineWrapper } from '../../../internal/Timeline';

const BankTransferResultInstructions = () => {
    const { i18n } = useCoreContext();

    return (
        <TimelineWrapper>
            <Timeline
                instructions={[
                    i18n.get('bankTransfer.instruction.step1'),
                    i18n.get('bankTransfer.instruction.step2'),
                    i18n.get('bankTransfer.instruction.step3'),
                    i18n.get('bankTransfer.instruction.step4')
                ]}
            />
        </TimelineWrapper>
    );
};

export { BankTransferResultInstructions };

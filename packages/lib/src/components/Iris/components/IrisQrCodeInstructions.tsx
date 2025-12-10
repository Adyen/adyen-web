import { h } from 'preact';

import { Timeline, TimelineWrapper } from '../../internal/Timeline';
import { useCoreContext } from '../../../core/Context/CoreProvider';

export const IrisQrCodeInstructions = () => {
    const { i18n } = useCoreContext();
    return (
        <TimelineWrapper>
            <Timeline
                instructions={[
                    i18n.get('Open your preferred banking app'),
                    i18n.get('Scan the QR code with your banking app'),
                    i18n.get('Complete the payment in the app and wait for the confirmation here.')
                ]}
            />
        </TimelineWrapper>
    );
};

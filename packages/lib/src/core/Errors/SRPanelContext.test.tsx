import { h } from 'preact';
import { render } from '@testing-library/preact';
import useSRPanelContext from './useSRPanelContext';
import type { ISRPanelContext } from './SRPanelContext';

describe('SRPanelContext', () => {
    test('should provide a default value with every member null outside a provider', () => {
        let contextValue: ISRPanelContext | undefined;

        const Probe = () => {
            contextValue = useSRPanelContext();
            return null;
        };

        render(<Probe />);

        expect(contextValue).toEqual({
            srPanel: null,
            setSRMessagesFromObjects: null,
            setSRMessagesFromStrings: null,
            clearSRPanel: null,
            shouldMoveFocusSR: null
        });
    });
});

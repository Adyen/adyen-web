import { mock } from 'jest-mock-extended';
import { SRPanel } from '../../src/core/Errors/SRPanel';

function setupSRPanelMock() {
    const srPanel = mock<SRPanel>({
        moveFocus: true
    });
    return srPanel;
}

global.srPanel = setupSRPanelMock();

import { SRPanel } from '../../src/core/Errors/SRPanel';

function setupSRPanelMock() {
    const srPanel = new SRPanel(global.core, {
        moveFocus: true,
        enabled: true
    });
    return srPanel;
}

global.srPanel = setupSRPanelMock();

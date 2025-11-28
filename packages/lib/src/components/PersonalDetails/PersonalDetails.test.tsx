import { render, screen } from '@testing-library/preact';
import PersonalDetails from './PersonalDetails';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('PersonalDetails', () => {
    test('should render FormInstruction by default', async () => {
        const core = setupCoreMock();

        const personalDetails = new PersonalDetails(core, {
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: core.modules.srPanel }
        });
        render(personalDetails.render());

        expect(await screen.findByText(/all fields are required unless marked otherwise./i)).toBeTruthy();
    });
});

import { render, screen } from '@testing-library/preact';
import PersonalDetails from './PersonalDetails';

describe('PersonalDetails', () => {
    test('should render FormInstruction by default', async () => {
        const personalDetails = new PersonalDetails({
            core: global.core,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });
        render(personalDetails.render());
        expect(await screen.findByText(/all fields are required unless marked otherwise./i)).toBeTruthy();
    });
});

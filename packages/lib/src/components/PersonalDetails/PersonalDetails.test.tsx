// @ts-ignore ignore
import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import PersonalDetails from './PersonalDetails';
import { Resources } from '../../core/Context/Resources';
import Language from '../../language';

describe('PersonalDetails', () => {
    test('should render FormInstruction by default', async () => {
        render(<PersonalDetails i18n={new Language()} loadingContext="test" modules={{ resources: new Resources() }} />);
        expect(await screen.findByText(/all fields are required unless marked otherwise./i)).toBeTruthy();
    });
});

/** @tsx h */
import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import DokuInput from './DokuInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

describe('DokuInput', () => {
    const customRender = ui => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                {ui}
            </CoreProvider>
        );
    };

    test('should only render PersonalDetails by default', async () => {
        customRender(<DokuInput />);
        expect(await screen.findByText('First name')).toBeTruthy();
        expect(await screen.findByText('Last name')).toBeTruthy();
        expect(await screen.findByText('Email address')).toBeTruthy();
        expect(screen.queryByText(/All fields are required unless marked otherwise./i)).toBeVisible();
        expect(screen.queryByText(/Confirm purchase/i)).toBeNull();
    });
});

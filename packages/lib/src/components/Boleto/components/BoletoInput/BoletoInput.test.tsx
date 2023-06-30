import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import BoletoInput from './BoletoInput';
import CoreProvider from '../../../../core/Context/CoreProvider';
import { Resources } from '../../../../core/Context/Resources';

describe('BoletoInput', () => {
    const customRender = ui => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={new Resources()}>
                {ui}
            </CoreProvider>
        );
    };

    test('should render BrazilPersonalDetail by default', async () => {
        customRender(<BoletoInput />);
        expect(await screen.findByText('Personal details')).toBeTruthy();
    });

    test('should render Address by default', async () => {
        customRender(<BoletoInput />);
        expect(await screen.findByRole('group', { name: /Billing address/i })).toBeTruthy();
    });

    test('should render SendCopyToEmail by default', async () => {
        customRender(<BoletoInput />);
        expect(await screen.findByText(/Send a copy to my email/i)).toBeTruthy();
    });

    test('should render FormInstruction by default', async () => {
        customRender(<BoletoInput />);
        expect(await screen.findByText(/All fields are required unless marked otherwise./i)).toBeTruthy();
    });

    test('should show form instruction if either the personal detail or the address form is shown and showFormInstruction sets to true', async () => {
        customRender(<BoletoInput personalDetailsRequired={false} />);
        expect(await screen.findByText(/All fields are required unless marked otherwise./i)).toBeTruthy();
    });

    test('should not show form instruction if neither the personal detail nor the address form is shown', () => {
        customRender(<BoletoInput personalDetailsRequired={false} billingAddressRequired={false} />);
        expect(screen.queryByText(/All fields are required unless marked otherwise./i)).toBeNull();
    });

    test('should not show form instruction if showFormInstruction sets to false', () => {
        customRender(<BoletoInput showFormInstruction={false} />);
        expect(screen.queryByText(/All fields are required unless marked otherwise./i)).toBeNull();
    });
});

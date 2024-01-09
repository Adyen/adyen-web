import { render, screen } from '@testing-library/preact';
import { h } from 'preact';
import Language from '../../language';
import { Resources } from '../../core/Context/Resources';
import CoreProvider from '../../core/Context/CoreProvider';
import Instructions from './Instructions';

describe('Instructions', () => {
    const customRender = (ui: h.JSX.Element) => {
        return render(
            // @ts-ignore ignore
            <CoreProvider i18n={new Language()} loadingContext="test" resources={new Resources()}>
                {ui}
            </CoreProvider>
        );
    };

    test('should see a list of instructions and footnote', async () => {
        customRender(<Instructions />);
        expect(await screen.findByText('Open the PayMe app', { exact: false })).toBeInTheDocument();
        expect(await screen.findByText('Scan the QR code', { exact: false })).toBeInTheDocument();
        expect(await screen.findByText('Complete the payment in the app', { exact: false })).toBeInTheDocument();
        expect(await screen.findByText('Please do not close this page before the payment is completed', { exact: false })).toBeInTheDocument();
    });
});

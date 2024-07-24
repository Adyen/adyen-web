import { render, screen } from '@testing-library/preact';
import { h } from 'preact';
import { CoreProvider } from '../../core/Context/CoreProvider';
import Instructions from './Instructions';

describe('Instructions', () => {
    const customRender = (ui: h.JSX.Element) => {
        return render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
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

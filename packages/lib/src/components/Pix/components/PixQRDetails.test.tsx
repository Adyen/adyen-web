import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import PixQRDetails from './PixQRDetails';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { QRLoaderDetailsProvider } from '../../internal/QRLoader';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';

const QR_CODE_IMAGE_URL = 'https://example.com/image.png';
const QR_CODE_DATA = 'qrCodeData';
const onTickMock = jest.fn();
const onQRCodeLoadMock = jest.fn();
const onTimeUpMock = jest.fn();
const handleCopyMock = jest.fn((completed: () => void) => completed());

const renderPixQRDetails = () => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={new SRPanel(global.core)}>
                <QRLoaderDetailsProvider
                    qrCodeImage={QR_CODE_IMAGE_URL}
                    qrCodeData={QR_CODE_DATA}
                    percentage={100}
                    timeToPay="You have %@ to pay"
                    countdownTime={15}
                    onTick={onTickMock}
                    onQRCodeLoad={onQRCodeLoadMock}
                    onTimeUp={onTimeUpMock}
                    handleCopy={handleCopyMock}
                    copyBtn
                >
                    <PixQRDetails />
                </QRLoaderDetailsProvider>
            </SRPanelProvider>
        </CoreProvider>
    );
};

describe('PixQRDetails', () => {
    test('should render qr code', () => {
        renderPixQRDetails();
        expect(screen.getByText('Scan the QR code with the Pix app')).toBeInTheDocument();
        expect(screen.getByAltText('Scan QR code')).toHaveAttribute('src', QR_CODE_IMAGE_URL);
    });

    test('can switch between qr code and copy-paste view', async () => {
        const user = userEvent.setup();
        renderPixQRDetails();

        const copyAndPasteControl = await screen.findByRole('button', { name: 'Copy and Paste' });
        await user.click(copyAndPasteControl);

        await waitFor(() => {
            expect(screen.getByText('Copy the code below and paste it into your banking app')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Pix code')).toHaveTextContent(QR_CODE_DATA);
    });

    test('can copy code with copy button', async () => {
        const user = userEvent.setup();
        renderPixQRDetails();

        const copyAndPasteControl = await screen.findByRole('button', { name: 'Copy and Paste' });
        await user.click(copyAndPasteControl);

        await waitFor(() => {
            expect(screen.getByText('Copy the code below and paste it into your banking app')).toBeInTheDocument();
        });

        const copyButton = await screen.findByRole('button', { name: 'Copy Pix code' });
        await user.click(copyButton);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Pix code copied' })).toBeInTheDocument();
        });

        expect(handleCopyMock).toHaveBeenCalledTimes(1);
    });
});

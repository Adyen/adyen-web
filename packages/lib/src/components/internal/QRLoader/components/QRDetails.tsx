import { h, Fragment } from 'preact';
import { QRImage } from './QRImage';
import { QRProgressbar } from './QRProgressbar';
import { QRCountdown } from './QRCountdown';
import { QRInstructions } from './QRIntructions';
import { QRCodeCopyButton } from './QRCodeCopyButton';
import { useQRLoaderDetails } from '../QRLoaderDetailsProvider';

export const QRDetails = () => {
    const { type, qrCodeData, qrCodeImage, percentage, timeToPay, copyBtn, instructions, onTick, countdownTime, onQRCodeLoad, onTimeUp, handleCopy } =
        useQRLoaderDetails();

    return (
        <Fragment>
            <QRImage type={type} src={qrCodeImage} onLoad={onQRCodeLoad} />

            <QRProgressbar percentage={percentage} />

            <QRCountdown countdownTime={countdownTime} timeToPay={timeToPay} onTick={onTick} onCompleted={onTimeUp} />

            {instructions && <QRInstructions instructions={instructions} />}

            {copyBtn && (
                <div className="adyen-checkout__qr-loader__actions">
                    <QRCodeCopyButton text={qrCodeData} handleCopy={handleCopy} />
                </div>
            )}
        </Fragment>
    );
};

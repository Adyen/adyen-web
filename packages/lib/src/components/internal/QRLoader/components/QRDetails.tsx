import { h, Fragment } from 'preact';
import QRImage from './QRImage';
import QRProgressbar from './QRProgressbar';
import QRCountdown from './QRCountdown';
import QRInstructions from './QRIntructions';
import QRCodeCopyButton from './QRCodeCopyButton';
import { useQRLoaderDetails } from '../QRLoaderDetailsProvider';

const QRDetails = () => {
    const { qrCodeImage, percentage, timeToPay, copyBtn, instructions, onTick, countdownTime, onQRCodeLoad, onTimeUp, handleCopy } =
        useQRLoaderDetails();

    return (
        <Fragment>
            <QRImage src={qrCodeImage} onLoad={onQRCodeLoad} />

            <QRProgressbar percentage={percentage} />

            <QRCountdown countdownTime={countdownTime} timeToPay={timeToPay} onTick={onTick} onCompleted={onTimeUp} />

            {instructions && <QRInstructions instructions={instructions} />}

            {copyBtn && <QRCodeCopyButton handleCopy={handleCopy} />}
        </Fragment>
    );
};

export default QRDetails;

import { Fragment, h } from 'preact';
import { QRImage, QRProgressbar, QRCountdown, QRInstructions, QRCodeCopyButton, useQRLoaderDetails } from '../../internal/QRLoader';
import { useMemo, useState } from 'preact/hooks';
import SegmentedControl, { SegmentedControlOptions } from '../../internal/SegmentedControl/SegmentedControl';
import { getUniqueId } from '../../../utils/idGenerator';
import isMobile from '../../../utils/isMobile';

const PixQRDetails = () => {
    const { qrCodeData, qrCodeImage, percentage, timeToPay, copyBtn, instructions, onTick, countdownTime, onQRCodeLoad, onTimeUp, handleCopy } =
        useQRLoaderDetails();

    const qrCodeControlId = useMemo(() => getUniqueId('pix-qrcode-control'), []);
    const copyAndPasteControlId = useMemo(() => getUniqueId('pix-copy-and-paste-control'), []);

    const inputOptions: SegmentedControlOptions<string> = useMemo(() => {
        let options = [
            {
                value: 'pix-qrcode-option',
                label: 'QR code',
                id: 'pix-qrcode-option',
                controls: qrCodeControlId
            },
            {
                value: 'pix-copy-and-paste-option',
                label: 'Copy and Paste',
                id: 'pix-copy-and-paste-option',
                controls: copyAndPasteControlId
            }
        ];

        if (isMobile()) {
            options = options.reverse();
        }

        return options;
    }, [qrCodeControlId, copyAndPasteControlId]);

    const defaultOption = inputOptions[0].value;
    const [selectedInput, setSelectedInput] = useState<string>(defaultOption);

    return (
        <div className="adyen-checkout__pix__qr_details">
            <QRProgressbar percentage={percentage} />
            <QRCountdown countdownTime={countdownTime} timeToPay={timeToPay} onTick={onTick} onCompleted={onTimeUp} />
            <SegmentedControl classNameModifiers={['pix']} selectedValue={selectedInput} options={inputOptions} onChange={setSelectedInput} />

            {selectedInput === 'pix-qrcode-option' && (
                <Fragment>
                    {instructions && <QRInstructions instructions={instructions} />}
                    <QRImage src={qrCodeImage} onLoad={onQRCodeLoad} />
                </Fragment>
            )}
            {selectedInput === 'pix-copy-and-paste-option' && (
                <Fragment>
                    {copyBtn && <QRCodeCopyButton handleCopy={handleCopy} />}
                    <span>{qrCodeData}</span>
                </Fragment>
            )}
        </div>
    );
};

export default PixQRDetails;

import { Fragment, h } from 'preact';
import { QRImage, QRProgressbar, QRCountdown, QRInstructions, QRCodeCopyButton, useQRLoaderDetails } from '../../internal/QRLoader';
import { useMemo, useState } from 'preact/hooks';
import SegmentedControl, { SegmentedControlOptions } from '../../internal/SegmentedControl/SegmentedControl';
import PixCode from './PixCode';
import { getUniqueId } from '../../../utils/idGenerator';
import isMobile from '../../../utils/isMobile';
import { useCoreContext } from '../../../core/Context/CoreProvider';

const PixQRDetails = () => {
    const { i18n } = useCoreContext();
    const { qrCodeData, qrCodeImage, percentage, timeToPay, onTick, countdownTime, onQRCodeLoad, onTimeUp, handleCopy } = useQRLoaderDetails();

    const qrCodeControlId = useMemo(() => getUniqueId('pix-qrcode-control'), []);
    const copyAndPasteControlId = useMemo(() => getUniqueId('pix-copy-and-paste-control'), []);

    const inputOptions: SegmentedControlOptions<string> = useMemo(() => {
        let options = [
            {
                value: 'pix-qrcode-option',
                label: i18n.get('pix.options.qrCode.label'),
                id: 'pix-qrcode-option',
                controls: qrCodeControlId
            },
            {
                value: 'pix-copy-and-paste-option',
                label: i18n.get('pix.options.copyAndPaste.label'),
                id: 'pix-copy-and-paste-option',
                controls: copyAndPasteControlId
            }
        ];

        if (isMobile()) {
            options = options.reverse();
        }

        return options;
    }, [qrCodeControlId, copyAndPasteControlId, i18n]);

    const defaultOption = inputOptions[0].value;
    const [selectedInput, setSelectedInput] = useState<string>(defaultOption);

    return (
        <div className="adyen-checkout__pix__qr_details">
            <QRProgressbar percentage={percentage} />
            <QRCountdown countdownTime={countdownTime} timeToPay={timeToPay} onTick={onTick} onCompleted={onTimeUp} />
            <SegmentedControl classNameModifiers={['pix']} selectedValue={selectedInput} options={inputOptions} onChange={setSelectedInput} />

            <div className="adyen-checkout__segmented-control--pix__content">
                {selectedInput === 'pix-qrcode-option' && (
                    <Fragment>
                        <QRInstructions instructions={i18n.get('pix.instructions.qrCode')} />
                        <QRImage src={qrCodeImage} onLoad={onQRCodeLoad} />
                    </Fragment>
                )}
                {selectedInput === 'pix-copy-and-paste-option' && (
                    <Fragment>
                        <QRInstructions instructions={i18n.get('pix.instructions.copyAndPaste')} />
                        <QRCodeCopyButton
                            copyLabel={i18n.get('pix.code.copy.label')}
                            copiedLabel={i18n.get('pix.code.copied.label')}
                            handleCopy={handleCopy}
                        />
                        <PixCode value={qrCodeData} />
                    </Fragment>
                )}
            </div>
        </div>
    );
};

export default PixQRDetails;

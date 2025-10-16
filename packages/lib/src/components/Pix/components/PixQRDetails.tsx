import { h } from 'preact';
import { QRImage, QRProgressbar, QRCountdown, QRCodeCopyButton, useQRLoaderDetails } from '../../internal/QRLoader';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Field from '../../internal/FormFields/Field';
import InputText from '../../internal/FormFields/InputText';

const PixQRDetails = () => {
    const { i18n } = useCoreContext();
    const { qrCodeData, qrCodeImage, percentage, timeToPay, onTick, countdownTime, onQRCodeLoad, onTimeUp, handleCopy } = useQRLoaderDetails();

    return (
        <div className="adyen-checkout__qr-loader--pix__qr_details">
            <QRImage src={qrCodeImage} onLoad={onQRCodeLoad} />
            <div className="adyen-checkout__qr-loader--pix__qr_details__timer">
                <QRProgressbar percentage={percentage} />
                <QRCountdown countdownTime={countdownTime} timeToPay={timeToPay} onTick={onTick} onCompleted={onTimeUp} />
            </div>
            <Field name="pix-code" useLabelElement={false}>
                <InputText
                    className="adyen-checkout__qr-loader--pix__qr_details__code"
                    value={qrCodeData}
                    readonly
                    aria-label={i18n.get('pix.code.label')}
                />
            </Field>
            <QRCodeCopyButton copyLabel={i18n.get('pix.code.copy.label')} copiedLabel={i18n.get('pix.code.copied.label')} handleCopy={handleCopy} />
        </div>
    );
};

export default PixQRDetails;

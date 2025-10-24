import { h } from 'preact';
import useImage from '../../../../core/Context/useImage';
import { useA11yReporter } from '../../../../core/Errors/useA11yReporter';

export const QRFinalState = ({ image, message }: { image: string; message: string }) => {
    const getImage = useImage();

    useA11yReporter(message);

    return (
        <div className="adyen-checkout__qr-loader adyen-checkout__qr-loader--result">
            <img
                className="adyen-checkout__qr-loader__icon adyen-checkout__qr-loader__icon--result"
                src={getImage({ imageFolder: 'components/' })(image)}
                alt={message}
            />
            <p className="adyen-checkout__qr-loader__subtitle">{message}</p>
        </div>
    );
};

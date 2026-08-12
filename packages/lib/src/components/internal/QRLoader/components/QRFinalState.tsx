import { h } from 'preact';
import useImage from '../../../../core/Context/useImage';

/**
 * The result message is announced by QRLoader rather than here. `loading` and `completed`/`expired`
 * flip in the same state batch, so this component mounts in the same commit that QRLoader
 * re-renders. Child effects run before parent effects, so a reporter here would write the result
 * and then immediately have it overwritten by the parent's terminal message.
 */
export const QRFinalState = ({ image, message }: Readonly<{ image: string; message: string }>) => {
    const getImage = useImage();

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

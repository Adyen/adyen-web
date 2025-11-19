import { h } from 'preact';
import useImage from '../../../../core/Context/useImage';

export const AwaitFinalState = ({ image, message }: { image: string; message: string }) => {
    const getImage = useImage();

    return (
        <div className="adyen-checkout__await adyen-checkout__await--result">
            <img
                className="adyen-checkout__await__icon adyen-checkout__await__icon--result"
                src={getImage({ imageFolder: 'components/' })(image)}
                alt={message}
            />
            <p className="adyen-checkout__await__subtitle adyen-checkout__await__subtitle--result">{message}</p>
        </div>
    );
};

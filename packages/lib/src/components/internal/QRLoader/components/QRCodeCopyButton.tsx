import { h } from 'preact';
import Button from '../../Button';
import { PREFIX } from '../../Icon/constants';
import useImage from '../../../../core/Context/useImage';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

const QRCodeCopyButton = ({ handleCopy }: { handleCopy: (onComplete: () => void) => void }) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <div className="adyen-checkout__qr-loader__actions">
            <Button
                inline
                variant="action"
                onClick={(_, { complete }) => handleCopy(complete)}
                icon={getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
                label={i18n.get('button.copy')}
            />
        </div>
    );
};

export default QRCodeCopyButton;

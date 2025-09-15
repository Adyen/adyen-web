import { h } from 'preact';
import Button from '../../Button';
import { PREFIX } from '../../Icon/constants';
import useImage from '../../../../core/Context/useImage';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

interface QRCodeCopyButtonProps {
    copyText?: string;
    copiedText?: string;
    handleCopy: (onComplete: () => void) => void;
}

const QRCodeCopyButton = ({ copyText, copiedText, handleCopy }: QRCodeCopyButtonProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Button
            variant="action"
            onClick={(_, { complete }) => handleCopy(complete)}
            icon={getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
            label={copyText ?? i18n.get('button.copy')}
            completedLabel={copiedText}
        />
    );
};

export default QRCodeCopyButton;

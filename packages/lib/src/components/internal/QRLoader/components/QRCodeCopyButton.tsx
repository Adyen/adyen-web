import { h } from 'preact';
import Button from '../../Button';
import { PREFIX } from '../../Icon/constants';
import useImage from '../../../../core/Context/useImage';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

interface QRCodeCopyButtonProps {
    copyLabel?: string;
    copiedLabel?: string;
    handleCopy: (onComplete: () => void) => void;
}

const QRCodeCopyButton = ({ copyLabel, copiedLabel, handleCopy }: QRCodeCopyButtonProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Button
            variant="action"
            onClick={(_, { complete }) => handleCopy(complete)}
            icon={getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
            onClickCompletedIcon={getImage({ imageFolder: 'components/' })(`${PREFIX}checkmark`)}
            label={copyLabel ?? i18n.get('button.copy')}
            onClickCompletedLabel={copiedLabel}
        />
    );
};

export default QRCodeCopyButton;

import { h } from 'preact';
import Button from '../../Button';
import { PREFIX } from '../../Icon/constants';
import useImage from '../../../../core/Context/useImage';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

const QRCodeCopyButton = ({ copyText, handleCopy }: { copyText?: string; handleCopy: (onComplete: () => void) => void }) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <Button
            variant="action"
            onClick={(_, { complete }) => handleCopy(complete)}
            icon={getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
            label={copyText ?? i18n.get('button.copy')}
        />
    );
};

export default QRCodeCopyButton;

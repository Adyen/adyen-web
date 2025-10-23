import { h } from 'preact';
import { CopyButton } from '../../Button/CopyButton';

interface QRCodeCopyButtonProps {
    text: string;
    copyLabel?: string;
    copiedLabel?: string;
    handleCopy: () => void;
}

const QRCodeCopyButton = ({ text, copyLabel, copiedLabel, handleCopy }: QRCodeCopyButtonProps) => {
    // todo think about how to use it
    return <CopyButton onClick={handleCopy} text={text} label={copyLabel} onClickCompletedLabel={copiedLabel} />;
};

export default QRCodeCopyButton;

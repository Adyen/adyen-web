import { h } from 'preact';
import { CopyButton } from '../../Button/CopyButton';

interface QRCodeCopyButtonProps {
    text: string;
    copyLabel?: string;
    copiedLabel?: string;
    handleCopy?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
}

export const QRCodeCopyButton = ({ text, copyLabel, copiedLabel, handleCopy }: QRCodeCopyButtonProps) => {
    return <CopyButton onClick={handleCopy} text={text} label={copyLabel} copiedLabel={copiedLabel} />;
};

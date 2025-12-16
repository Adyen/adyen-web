import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import Button from './Button';
import { ButtonProps } from './types';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import copyToClipboard from '../../../utils/clipboard';
import { PREFIX } from '../Icon/constants';
import useImage from '../../../core/Context/useImage';
import { stopPropagationForActionKeys } from './stopPropagationForActionKeys';

export interface CopyButtonProps extends Omit<ButtonProps, 'variant' | 'onClickCompletedLabel'> {
    /**
     * String that will get copied to the clipboard
     */
    text: string;
    copiedLabel?: string;
    onClick?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
}

const CopyButton = (props: CopyButtonProps) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const onClick = useCallback(
        (e, { complete }) => {
            void copyToClipboard(props.text);
            complete();
            props.onClick?.(e);
        },
        [props.text, props.onClick]
    );

    return (
        <Button
            {...props}
            variant="action"
            onClick={onClick}
            // Workaround: See ADR-2341 (docs/adr/ADR-2341-uielement-keyboard-event-propagation-workaround.md)
            onKeyPress={stopPropagationForActionKeys}
            onKeyDown={stopPropagationForActionKeys}
            icon={props.icon ?? getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
            label={props.label ?? i18n.get('button.copy')}
            onClickCompletedLabel={props.copiedLabel ?? i18n.get('button.copied')}
        />
    );
};

export { CopyButton };

import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import Button from './Button';
import { ButtonProps } from './types';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import copyToClipboard from '../../../utils/clipboard';
import { PREFIX } from '../Icon/constants';
import useImage from '../../../core/Context/useImage';

export interface CopyButtonProps extends ButtonProps {
    /**
     * String that will get copied to the clipboard
     */
    text: string;
    copiedLabel?: string;
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

    // todo: we should remove it from the whole sdk: onKeyPress is deprecated.
    const onKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.code === 'Enter' || event.key === ' ' || event.code === 'Space') {
            event.stopPropagation();
        }
    }, []);

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.code === 'Enter' || event.key === ' ' || event.code === 'Space') {
            event.stopPropagation();
        }
    }, []);

    return (
        <Button
            inline
            variant="action"
            onClick={onClick}
            // It's ok to have both, browsers will fire only one click event for enter key pressed.
            onKeyPress={onKeyPress}
            onKeyDown={onKeyDown}
            icon={props.icon ?? getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
            label={props.label ?? i18n.get('button.copy')}
            onClickCompletedLabel={props.copiedLabel ?? i18n.get('button.copied')}
        />
    );
};

export { CopyButton };

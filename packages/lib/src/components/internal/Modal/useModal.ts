import { useTrapFocus } from './useTrapFocus';
import { useCallback, useEffect } from 'preact/hooks';

type UseModalProps = {
    modalElement?: HTMLElement;
    isOpen: boolean;
    isDismissible: boolean;
    focusFirst: HTMLElement;
    focusAfterClose: HTMLElement;
    onClose(): void;
};

type UseModalHook = {
    /**
     * Function that focus on the 'focusAfterClose' element, and then closes the modal
     */
    closeModal(): void;
    handleClickOutside(event: MouseEvent): void;
};

const KEYCODE_ESC = 27;

const useModal = ({ modalElement, isOpen, isDismissible, focusFirst, focusAfterClose, onClose }: UseModalProps): UseModalHook => {
    useTrapFocus({ rootElement: modalElement, shouldTrap: isOpen, focusFirst });

    const closeModal = useCallback(() => {
        focusAfterClose.focus();
        onClose();
    }, [onClose, focusAfterClose]);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (isDismissible && event.target instanceof HTMLElement && !modalElement.contains(event.target)) {
                closeModal();
            }
        },
        [closeModal, isDismissible, modalElement]
    );

    useEffect(() => {
        if (!isOpen || !modalElement) return;
        const closeOnPressingEscape = (event: KeyboardEvent): void => {
            const isEscapePressed = event.key === 'Escape' || event.key === 'Esc' || event.keyCode === KEYCODE_ESC;
            if (isEscapePressed) {
                closeModal();
            }
        };

        modalElement.addEventListener('keydown', closeOnPressingEscape);
        return () => modalElement.removeEventListener('keydown', closeOnPressingEscape);
    }, [isOpen, modalElement, closeModal]);

    return { closeModal, handleClickOutside };
};

export { useModal };

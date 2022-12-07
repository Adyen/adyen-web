import { ComponentChildren, h } from 'preact';
import { useRef } from 'preact/hooks';
import cx from 'classnames';
import './Modal.scss';
import { useModal } from './useModal';

type ModalProps = {
    children: ({ onCloseModal }: { onCloseModal(): void }) => ComponentChildren;
    classNameModifiers?: string[];
    onClose(): void;
    isOpen: boolean;
    isDismissible?: boolean;
    labelledBy: string;
    describedBy: string;
    focusFirst: HTMLElement;
    focusAfterClose: HTMLElement;
};

const Modal = ({
    children,
    classNameModifiers = [],
    isOpen,
    onClose,
    isDismissible = true,
    labelledBy,
    describedBy,
    focusFirst,
    focusAfterClose,
    ...props
}: ModalProps) => {
    const modalContainerRef = useRef<HTMLDivElement>();
    const { closeModal, handleClickOutside } = useModal({
        modalElement: modalContainerRef.current,
        isOpen,
        isDismissible,
        focusFirst,
        focusAfterClose,
        onClose
    });

    return (
        <div
            className={cx(
                'adyen-checkout__modal-wrapper',
                classNameModifiers.map(m => `adyen-checkout__modal-wrapper--${m}`),
                { 'adyen-checkout__modal-wrapper--open': isOpen }
            )}
            role="dialog"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            aria-modal="true"
            aria-hidden={!isOpen}
            onClick={handleClickOutside}
            {...props}
        >
            <div className="adyen-checkout__modal" ref={modalContainerRef}>
                {children({ onCloseModal: closeModal })}
            </div>
        </div>
    );
};

export { Modal };

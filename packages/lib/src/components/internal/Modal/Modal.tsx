import { ComponentChildren, h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';
import cx from 'classnames';
import './Modal.scss';
import { useTrapFocus } from './useTrapFocus';

type ModalProps = {
    children: ComponentChildren;
    classNameModifiers?: string[];
    onClose(): void;
    isOpen: boolean;
    isDismissible?: boolean;
    labelledBy: string;
};

const Modal = ({ children, classNameModifiers = [], isOpen, onClose, isDismissible = true, labelledBy, ...props }: ModalProps) => {
    const modalContainerRef = useRef<HTMLDivElement>();
    useTrapFocus({ element: isOpen ? modalContainerRef.current : null });

    const handleClickOutside = useCallback(e => {
        if (isDismissible && open && !modalContainerRef.current.contains(e.target)) {
            onClose();
        }
    }, []);

    return (
        <div
            className={cx(
                'adyen-checkout__modal-wrapper',
                classNameModifiers.map(m => `adyen-checkout__modal-wrapper--${m}`),
                { 'adyen-checkout__modal-wrapper--open': isOpen }
            )}
            role="dialog"
            aria-labelledby={labelledBy}
            aria-modal="true"
            aria-hidden={!isOpen}
            onClick={handleClickOutside}
            {...props}
        >
            <div className="adyen-checkout__modal" ref={modalContainerRef}>
                {children}
            </div>
        </div>
    );
};

export { Modal };

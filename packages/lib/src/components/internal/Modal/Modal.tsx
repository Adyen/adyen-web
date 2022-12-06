import { ComponentChildren, h } from 'preact';
import { useCallback, useRef } from 'preact/hooks';
import cx from 'classnames';
import './Modal.scss';

let idGenerator = Date.now();

function getUniqueId() {
    idGenerator += 1;
    return `adyen-${idGenerator}`;
}

type ModalProps = {
    title?: string;
    children: ComponentChildren;
    classNameModifiers?: string[];
    onClose(): void;
    isOpen: boolean;
    isDismissible?: boolean;
};

const Modal = ({ children, classNameModifiers = [], isOpen, onClose, isDismissible = true }: ModalProps) => {
    const modalContainerRef = useRef<HTMLDivElement>();
    const labelledBy = getUniqueId();

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
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-hidden={!isOpen}
            onClick={handleClickOutside}
        >
            <div className="adyen-checkout__modal" ref={modalContainerRef}>
                {children}
            </div>
        </div>
    );
};

export { Modal };

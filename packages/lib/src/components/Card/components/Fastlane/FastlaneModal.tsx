import { h } from 'preact';
import { useRef } from 'preact/hooks';
import useImage from '../../../../core/Context/useImage';
import { Modal } from '../../../internal/Modal';
import Img from '../../../internal/Img';
import Button from '../../../internal/Button';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

import './FastlaneModal.scss';

let idGenerator = Date.now();

function getUniqueId() {
    idGenerator += 1;
    return `adyen-${idGenerator}`;
}

type CtPInfoModalProps = {
    isOpen: boolean;
    onClose(): void;
    focusAfterClose: HTMLElement;
};

const FASTLANE_BENEFITS = [
    {
        headerKey: 'card.fastlane.modal.benefit1.header',
        textKey: 'card.fastlane.modal.benefit1.text',
        image: 'cross',
        altImage: ''
    },
    {
        headerKey: 'card.fastlane.modal.benefit2.header',
        textKey: 'card.fastlane.modal.benefit2.text',
        image: 'cross',
        altImage: ''
    },
    {
        headerKey: 'card.fastlane.modal.benefit3.header',
        textKey: 'card.fastlane.modal.benefit3.text',
        image: 'cross',
        altImage: ''
    }
];

const FastlaneModal = ({ isOpen, onClose, focusAfterClose }: CtPInfoModalProps) => {
    const { i18n } = useCoreContext();
    const focusFirstElement = useRef<HTMLParagraphElement>();
    const getImage = useImage();

    const labelledBy = getUniqueId();
    const describedBy = getUniqueId();

    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            labelledBy={labelledBy}
            describedBy={describedBy}
            focusFirst={focusFirstElement.current}
            focusAfterClose={focusAfterClose}
        >
            {({ onCloseModal }) => (
                <div className="adyen-checkout-card-fastlane__modal">
                    <div className="adyen-checkout-card-fastlane__modal-button-container">
                        <Button
                            onClick={onCloseModal}
                            inline
                            variant="link"
                            ariaLabel="Close dialog"
                            label={<Img height="16" width="16" src={getImage({ imageFolder: 'components/' })('cross')} ariaHidden={true} alt="" />}
                        />
                    </div>

                    {FASTLANE_BENEFITS.map((benefit, index) => (
                        <div key={index} className="adyen-checkout-card-fastlane__modal-section">
                            <Img
                                className="adyen-checkout-card-fastlane__modal-image"
                                src={getImage({ imageFolder: 'components/' })(benefit.image)}
                                alt={benefit.altImage}
                            />
                            <h1 className="adyen-checkout-card-fastlane__modal-header">{i18n.get(benefit.headerKey)}</h1>
                            <div className="adyen-checkout-card-fastlane__modal-text">{i18n.get(benefit.textKey)}</div>
                        </div>
                    ))}

                    <Img
                        className="adyen-checkout-card-fastlane__modal-brand"
                        src={getImage({ imageFolder: 'components/' })(`paypal_fastlane_black`)}
                        alt={i18n.get('card.fastlane.a11y.logo')}
                    />
                </div>
            )}
        </Modal>
    );
};

export { FastlaneModal };

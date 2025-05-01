import { h } from 'preact';
import { useRef } from 'preact/hooks';
import useImage from '../../../../core/Context/useImage';
import { Modal } from '../../../internal/Modal';
import Img from '../../../internal/Img';
import Button from '../../../internal/Button';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import uuid from '../../../../utils/uuid';

import './InfoModal.scss';

interface InfoModalProps {
    isOpen: boolean;
    focusAfterClose: HTMLElement;
    onClose(): void;
}

const FASTLANE_BENEFITS = [
    {
        headerKey: 'card.fastlane.modal.benefit1.header',
        labelById: `adyen-fastlane-modal-label-${uuid()}`,
        descriptionTextKey: 'card.fastlane.modal.benefit1.text',
        describedById: `adyen-fastlane-modal-describedBy-${uuid()}`,
        image: 'fastlane_autofill',
        altImage: ''
    },
    {
        headerKey: 'card.fastlane.modal.benefit2.header',
        labelById: `adyen-fastlane-modal-label-${uuid()}`,
        descriptionTextKey: 'card.fastlane.modal.benefit2.text',
        describedById: `adyen-fastlane-modal-describedBy-${uuid()}`,
        image: 'fastlane_protection',
        altImage: ''
    },
    {
        headerKey: 'card.fastlane.modal.benefit3.header',
        labelById: `adyen-fastlane-modal-label-${uuid()}`,
        descriptionTextKey: 'card.fastlane.modal.benefit3.text',
        describedById: `adyen-fastlane-modal-describedBy-${uuid()}`,
        image: 'fastlane_ubiquity',
        altImage: ''
    }
];

const InfoModal = ({ isOpen, onClose, focusAfterClose }: InfoModalProps) => {
    const { i18n } = useCoreContext();
    const focusFirstElement = useRef<HTMLParagraphElement>();
    const getImage = useImage();

    const labelledBy = FASTLANE_BENEFITS.map(benefit => benefit.labelById).join(' ');
    const describedBy = FASTLANE_BENEFITS.map(benefit => benefit.describedById).join(' ');

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
                            ariaLabel={i18n.get('card.fastlane.a11y.closeDialog')}
                            label={
                                <Img height="10" width="10" src={getImage({ imageFolder: 'components/' })('cross_black')} ariaHidden={true} alt="" />
                            }
                        />
                    </div>

                    {FASTLANE_BENEFITS.map(benefit => (
                        <div key={benefit.labelById} className="adyen-checkout-card-fastlane__modal-section">
                            <Img
                                className="adyen-checkout-card-fastlane__modal-section-image"
                                src={getImage({ imageFolder: 'components/' })(benefit.image)}
                                alt={benefit.altImage}
                            />
                            <h1 id={benefit.labelById} className="adyen-checkout-card-fastlane__modal-section-header">
                                {i18n.get(benefit.headerKey)}
                            </h1>
                            <div id={benefit.describedById} className="adyen-checkout-card-fastlane__modal-section-text">
                                {i18n.get(benefit.descriptionTextKey)}
                            </div>
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

export { InfoModal };

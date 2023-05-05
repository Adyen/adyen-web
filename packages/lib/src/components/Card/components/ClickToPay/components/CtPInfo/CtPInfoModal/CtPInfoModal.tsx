import { Fragment, h } from 'preact';
import { Modal } from '../../../../../../internal/Modal';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPInfoModal.scss';
import Button from '../../../../../../internal/Button';
import { CtPBrand } from '../../CtPBrand';
import { useRef } from 'preact/hooks';
import Img from '../../../../../../internal/Img';
import useImage from '../../../../../../../core/Context/useImage';

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

const CtPInfoModal = ({ isOpen, onClose, focusAfterClose }: CtPInfoModalProps) => {
    const focusFirstElement = useRef<HTMLParagraphElement>();
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const labelledBy = getUniqueId();
    const describedBy = getUniqueId();

    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            classNameModifiers={['ctp']}
            labelledBy={labelledBy}
            describedBy={describedBy}
            focusFirst={focusFirstElement.current}
            focusAfterClose={focusAfterClose}
        >
            {({ onCloseModal }) => (
                <Fragment>
                    <Img className="adyen-checkout__ctp-modal-header-image" src={getImage({ imageFolder: 'components/' })('ctp_landscape')} alt="" />
                    <h1 id={labelledBy} className="adyen-checkout__ctp-modal-title">
                        {i18n.get('ctp.infoPopup.title')}
                    </h1>

                    <div id={describedBy}>
                        <p tabIndex={-1} ref={focusFirstElement} className="adyen-checkout__ctp-modal-text">
                            {i18n.get('ctp.infoPopup.subtitle')}
                        </p>

                        <ul className="adyen-checkout__ctp-modal-text adyen-checkout__ctp-modal-benefits" type="disc">
                            <li>{i18n.get('ctp.infoPopup.benefit1')}</li>
                            <li>{i18n.get('ctp.infoPopup.benefit2')}</li>
                            <li>{i18n.get('ctp.infoPopup.benefit3')}</li>
                        </ul>

                        <CtPBrand classNameModifiers={['popup']} />
                    </div>

                    <Button onClick={onCloseModal} label={i18n.get('close')} />
                </Fragment>
            )}
        </Modal>
    );
};

export { CtPInfoModal };

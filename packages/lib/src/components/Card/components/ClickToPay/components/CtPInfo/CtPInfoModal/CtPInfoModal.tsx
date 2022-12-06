import { h } from 'preact';
import { Modal } from '../../../../../../internal/Modal';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPInfoModal.scss';
import Button from '../../../../../../internal/Button';
import { CtPBrand } from '../../CtPBrand';

let idGenerator = Date.now();

function getUniqueId() {
    idGenerator += 1;
    return `adyen-${idGenerator}`;
}

type CtPInfoModalProps = {
    isOpen: boolean;
    onClose(): void;
};

const CtPInfoModal = ({ isOpen, onClose }: CtPInfoModalProps) => {
    const { i18n } = useCoreContext();
    const labelledBy = getUniqueId();

    return (
        <Modal onClose={onClose} isOpen={isOpen} classNameModifiers={['ctp']} labelledBy={labelledBy}>
            <h1 id={labelledBy} className="adyen-checkout__ctp-modal-title">
                {i18n.get('ctp.infoPopup.title')}
            </h1>

            <p className="adyen-checkout__ctp-modal-text">{i18n.get('ctp.infoPopup.subtitle')}</p>

            <ul className="adyen-checkout__ctp-modal-text adyen-checkout__ctp-modal-benefits" type="disc">
                <li>{i18n.get('ctp.infoPopup.benefit1')}</li>
                <li>{i18n.get('ctp.infoPopup.benefit2')}</li>
                <li>{i18n.get('ctp.infoPopup.benefit3')}</li>
            </ul>

            <CtPBrand classNameModifiers={['popup']} />

            <Button onClick={onClose} label="Close" />
        </Modal>
    );
};

export { CtPInfoModal };

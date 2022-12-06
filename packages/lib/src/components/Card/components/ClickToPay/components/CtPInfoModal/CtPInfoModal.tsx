import { h } from 'preact';
import { Modal } from '../../../../../internal/Modal';
import { useCallback, useState } from 'preact/hooks';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CtPInfoModal.scss';
import Button from '../../../../../internal/Button';
import { CtPBrand } from '../CtPBrand';

const CtPInfoModal = () => {
    const { i18n } = useCoreContext();
    const [isOpen, setIsOpen] = useState<boolean>(true);

    const handleOnClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <Modal onClose={handleOnClose} isOpen={isOpen} classNameModifiers={['ctp']}>
            <h1 className="adyen-checkout__ctp-modal-title">{i18n.get('ctp.infoPopup.title')}</h1>

            <p className="adyen-checkout__ctp-modal-text">{i18n.get('ctp.infoPopup.subtitle')}</p>

            <ul className="adyen-checkout__ctp-modal-text adyen-checkout__ctp-modal-benefits" type="disc">
                <li>{i18n.get('ctp.infoPopup.benefit1')}</li>
                <li>{i18n.get('ctp.infoPopup.benefit2')}</li>
                <li>{i18n.get('ctp.infoPopup.benefit3')}</li>
            </ul>

            <CtPBrand classNameModifiers={['popup']} />

            <Button onClick={handleOnClose}>Close</Button>
        </Modal>
    );
};

export { CtPInfoModal };

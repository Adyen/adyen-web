import { Fragment, h } from 'preact';
import { useMemo, useRef } from 'preact/hooks';
import { CtPBrand } from '../../CtPBrand';
import useClickToPayContext from '../../../context/useClickToPayContext';
import { useCoreContext } from '../../../../../../core/Context/CoreProvider';
import useImage from '../../../../../../core/Context/useImage';
import { Modal } from '../../../../Modal';
import Img from '../../../../Img';
import Button from '../../../../Button';
import './CtPInfoModal.scss';

/**
 * Shown when the modal opens outside a Click to Pay flow (e.g. from the Card sign-up), where no schemes are known
 */
const FALLBACK_SCHEMES = ['mc', 'visa'];

let idGenerator = Date.now();

function getUniqueId() {
    idGenerator += 1;
    return `adyen-${idGenerator}`;
}

type CtPInfoModalProps = {
    isOpen: boolean;
    onClose(): void;
    focusAfterClose: HTMLElement | null;
};

const CtPInfoModal = ({ isOpen, onClose, focusAfterClose }: Readonly<CtPInfoModalProps>) => {
    const focusFirstElement = useRef<HTMLParagraphElement>(null);
    const { i18n } = useCoreContext();
    const { schemes } = useClickToPayContext();
    const getImage = useImage();

    const labelledBy = useMemo(() => getUniqueId(), []);
    const describedBy = useMemo(() => getUniqueId(), []);

    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            classNameModifiers={['ctp']}
            labelledBy={labelledBy}
            describedBy={describedBy}
            focusFirst={focusFirstElement.current ?? undefined}
            focusAfterClose={focusAfterClose}
        >
            {({ onCloseModal }) => (
                <Fragment>
                    <div className="adyen-checkout__ctp-modal-header">
                        <CtPBrand schemes={schemes.length ? schemes : FALLBACK_SCHEMES} />
                    </div>

                    <div className="adyen-checkout__ctp-modal-content">
                        <Img
                            className="adyen-checkout__ctp-modal-header-image"
                            src={getImage({ imageFolder: 'components/' })('ctp_landscape')}
                            alt=""
                        />
                        <h2 id={labelledBy} className="adyen-checkout__ctp-modal-title">
                            {i18n.get('ctp.infoPopup.title')}
                        </h2>

                        <div id={describedBy}>
                            <p tabIndex={-1} ref={focusFirstElement} className="adyen-checkout__ctp-modal-text adyen-checkout__ctp-modal-description">
                                {i18n.get('ctp.infoPopup.subtitle')}
                            </p>

                            <ul className="adyen-checkout__ctp-modal-text adyen-checkout__ctp-modal-benefits">
                                <li>{i18n.get('ctp.infoPopup.benefit1')}</li>
                                <li>{i18n.get('ctp.infoPopup.benefit2')}</li>
                                <li>{i18n.get('ctp.infoPopup.benefit3')}</li>
                            </ul>
                        </div>

                        <Button onClick={onCloseModal} label={i18n.get('close')} />
                    </div>
                </Fragment>
            )}
        </Modal>
    );
};

export { CtPInfoModal };

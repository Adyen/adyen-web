import { Fragment, h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { CtPInfoModal } from './CtPInfoModal';
import useImage from '../../../../../core/Context/useImage';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import Img from '../../../Img';
import './CtPInfo.scss';

const CtPInfo = () => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>();
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const url = getImage({ imageFolder: 'components/' })('info');

    const handleOnClose = useCallback(() => {
        setIsInfoModalOpen(false);
    }, []);

    const handleOnIconClick = useCallback(() => {
        setIsInfoModalOpen(true);
    }, []);

    return (
        <Fragment>
            <button
                ref={buttonRef}
                onClick={handleOnIconClick}
                className="adyen-web__ctp-info-button"
                aria-label={i18n.get('ctp.aria.infoModalButton')}
                type="button"
            >
                <Img height="15" src={url} ariaHidden={true} />
            </button>

            <CtPInfoModal isOpen={isInfoModalOpen} onClose={handleOnClose} focusAfterClose={buttonRef.current} />
        </Fragment>
    );
};

export { CtPInfo };

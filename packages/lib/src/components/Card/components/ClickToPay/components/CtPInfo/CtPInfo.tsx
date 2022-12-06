import { Fragment, h } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import getImageUrl from '../../../../../../utils/get-image';
import Img from '../../../../../internal/Img';
import { CtPInfoModal } from './CtPInfoModal';
import { useCallback, useState } from 'preact/hooks';
import './CtPInfo.scss';

const CtPInfo = () => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const { loadingContext } = useCoreContext();
    const url = getImageUrl({ loadingContext, imageFolder: 'components/' })('copy');

    const handleOnClose = useCallback(() => {
        setIsInfoModalOpen(false);
    }, []);

    const handleOnIconClick = useCallback(() => {
        setIsInfoModalOpen(true);
    }, []);

    return (
        <Fragment>
            <button onClick={handleOnIconClick} className="adyen-web__ctp-info-button" aria-label="What is Click to Pay" type="button">
                <Img height="15" src={url} ariaHidden={true} />
            </button>

            <CtPInfoModal isOpen={isInfoModalOpen} onClose={handleOnClose} />
        </Fragment>
    );
};

export { CtPInfo };

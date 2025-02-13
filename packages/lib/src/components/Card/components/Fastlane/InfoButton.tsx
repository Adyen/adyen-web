import { Fragment, h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import { InfoModal } from './InfoModal';
import Img from '../../../internal/Img';
import Button from '../../../internal/Button';

const InfoButton = () => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const buttonRef = useRef();

    const handleOnClose = useCallback(() => {
        setIsInfoModalOpen(false);
    }, []);

    const handleOnIconClick = useCallback(() => {
        setIsInfoModalOpen(true);
    }, []);

    return (
        <Fragment>
            <Button
                buttonRef={buttonRef}
                onClick={handleOnIconClick}
                classNameModifiers={['fastlane-info-modal']}
                variant="link"
                ariaLabel={i18n.get('card.fastlane.a11y.openDialog')}
                label={<Img height="14" width="14" src={getImage({ imageFolder: 'components/' })('fastlane_info')} alt="" ariaHidden={true} />}
            />

            <InfoModal isOpen={isInfoModalOpen} onClose={handleOnClose} focusAfterClose={buttonRef.current} />
        </Fragment>
    );
};

export { InfoButton };

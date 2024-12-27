import { Fragment, h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import useImage from '../../../../core/Context/useImage';
import { FastlaneModal } from './FastlaneModal';
import Img from '../../../internal/Img';
import Button from '../../../internal/Button';

// import './CtPInfo.scss';

const FastlaneInfo = () => {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const buttonRef = useRef();
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
            <Button
                buttonRef={buttonRef}
                onClick={handleOnIconClick}
                classNameModifiers={['fastlane-modal']}
                inline
                variant="link"
                ariaLabel={i18n.get('card.fastlane.a11y.openModal')}
                label={<Img height="16" width="16" src={url} alt="" ariaHidden={true} />}
            />

            <FastlaneModal isOpen={isInfoModalOpen} onClose={handleOnClose} focusAfterClose={buttonRef.current} />
        </Fragment>
    );
};

export { FastlaneInfo };

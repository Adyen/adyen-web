import { h } from 'preact';
import { useState } from 'preact/hooks';
import classNames from 'classnames';
import { RadioButtonIconProps } from './types';
import './RadioButtonIcon.scss';

const RadioButtonIcon = ({ onClick, dataValue, notSelected, imageURL, altName, hasRadioIcon }: RadioButtonIconProps) => {
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleError = () => {
        setHasLoaded(false);
    };

    const handleLoad = () => {
        setHasLoaded(true);
    };

    const fieldClassnames = classNames({
        'adyen-checkout__input-icon': true,
        'adyen-checkout__input-icon--hidden': !hasLoaded,
        'adyen-checkout__input-icon--no-radio-icon': !hasRadioIcon
    });

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
        <img
            className={fieldClassnames}
            onError={handleError}
            onLoad={handleLoad}
            alt={altName}
            src={imageURL}
            // onClick={onClick}
            data-value={dataValue}
        />
    );
};

export default RadioButtonIcon;

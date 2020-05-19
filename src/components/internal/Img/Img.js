import { useRef, useState, useEffect } from 'preact/hooks';
import cx from 'classnames';
import './Img.scss';
import { h } from 'preact';

export default function Img(props) {
    const { backgroundUrl = '', className = '', classNameModifiers = [], src = '', showOnError = false } = props;
    const [loaded, setLoaded] = useState(false);
    const imageRef = useRef(null);

    const handleLoad = () => {
        setLoaded(true);
    };

    const handleError = () => {
        setLoaded(showOnError);
    };

    const classNames = cx(
        [className],
        'adyen-checkout__image',
        { 'adyen-checkout__image--loaded': loaded },
        ...classNameModifiers.map(modifier => `adyen-checkout__image--${modifier}`)
    );

    useEffect(() => {
        const image = backgroundUrl ? new Image() : imageRef.current;
        image.src = backgroundUrl || src;
        image.onload = handleLoad;
        setLoaded(!!image.complete);
    }, []);

    if (backgroundUrl) {
        return <div style={{ backgroundUrl }} {...props} className={classNames} />;
    }

    return <img {...props} ref={imageRef} className={classNames} onError={handleError} />;
}

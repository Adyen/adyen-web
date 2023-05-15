import { h } from 'preact';
import cx from 'classnames';
import useImage from '../../../core/Context/useImage';

interface IconProps {
    type: string;
    className?: string;
    alt?: string;
    height?: number;
    width?: number;
}

const Icon = ({ type, className = '', alt = '', height, width }: IconProps) => {
    const getImage = useImage();
    const iconUrl = getImage({ imageFolder: 'components/' })?.(type);

    return <img className={cx('adyen-checkout__icon', className)} alt={alt} src={iconUrl} height={height} width={width} />;
};

export default Icon;

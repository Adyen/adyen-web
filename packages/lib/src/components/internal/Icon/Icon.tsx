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

    return (
        <div>
            <p>Status: {type.value}</p>
        </div>
    );
};

export default Icon;

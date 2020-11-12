import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import getImageUrl from '../../../utils/get-image';
import cx from 'classnames';

interface IconProps {
    type: string;
    className?: string;
}

const Icon = ({ type, className = '' }: IconProps) => {
    const { loadingContext } = useCoreContext();
    const iconUrl = getImageUrl({ loadingContext, imageFolder: 'components/' })(type);

    return <img className={cx('adyen-checkout__icon', className)} alt={type} src={iconUrl} />;
};

export default Icon;

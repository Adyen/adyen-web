import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import getImageUrl from '../../../utils/get-image';

interface IconProps {
    type: string;
}

const Icon = ({ type }: IconProps) => {
    const { loadingContext } = useCoreContext();
    const iconUrl = getImageUrl({ loadingContext, imageFolder: 'components/' })(type);
    return <img className="adyen-checkout__icon" alt={type} src={iconUrl} />;
};

export default Icon;

import { h } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import getImageUrl from '../../../../../../utils/get-image';
import Img from '../../../../../internal/Img';

const CtPInfoIcon = () => {
    const { loadingContext } = useCoreContext();
    const url = getImageUrl({ loadingContext, imageFolder: 'components/' })('copy');

    return <Img height="88" className="adyen-checkout__status__icon" src={url} alt={'Click to pay information'} />;
};

export { CtPInfoIcon };

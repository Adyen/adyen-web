import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import useImage from '../../../core/Context/useImage';
import Img from '../../internal/Img';

export const SettlementInfo = () => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <div className="adyen-checkout__eftpad-canada-info">
            <Img height="18" width="18" src={getImage({ imageFolder: 'components/' })('info_black')} alt="" ariaHidden={true} />
            <div>{i18n.get('eftpad-canada.settlement-info')}</div>
        </div>
    );
};

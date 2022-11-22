import { h } from 'preact';
import useCoreContext from '../../../../../../core/Context/useCoreContext';

import Img from '../../../../../internal/Img';
import CtPLogoutLink from './CtPLogoutLink';
import classnames from 'classnames';
import useClickToPayContext from '../../context/useClickToPayContext';
import { SchemeNames } from '../../services/sdks/utils';
import './CtPSection.scss';

interface CtPSectionProps {
    children?: h.JSX.Element[];
}

const CtPSection = ({ children }: CtPSectionProps): h.JSX.Element => {
    const { loadingContext, resources } = useCoreContext();
    const { schemes } = useClickToPayContext();

    const ctpImageUrl = resources.getImage({ loadingContext })('ctp');
    const pipeImageUrl = resources.getImage({ loadingContext, imageFolder: 'components/' })('pipe');

    return (
        <div className="adyen-checkout-ctp__section">
            <div className="adyen-checkout-ctp__section-header">
                <Img className="adyen-checkout-ctp__section-header-logo" src={ctpImageUrl} alt={'Click to Pay'} />
                <Img className="adyen-checkout-ctp__section-header-pipe" src={pipeImageUrl} alt="" />

                {schemes.map(brand => (
                    <Img
                        key={brand}
                        className={classnames('adyen-checkout-ctp__section-header-scheme', `adyen-checkout-ctp__section-header-scheme-${brand}`)}
                        src={resources.getImage({ loadingContext })(brand)}
                        alt={SchemeNames[brand]}
                    />
                ))}
                <CtPLogoutLink />
            </div>

            {children}
        </div>
    );
};

export default CtPSection;

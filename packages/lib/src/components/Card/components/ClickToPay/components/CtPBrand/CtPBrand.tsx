import { h } from 'preact';
import classnames from 'classnames';
import Img from '../../../../../internal/Img';
import getImage from '../../../../../../utils/get-image';
import { SchemeNames } from '../../services/sdks/utils';
import useClickToPayContext from '../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import './CtPBrand.scss';

type CtPBrandProps = {
    classNameModifiers?: string[];
};

const CtPBrand = ({ classNameModifiers = [] }: CtPBrandProps) => {
    const { loadingContext } = useCoreContext();
    const { schemes } = useClickToPayContext();

    const ctpImageUrl = getImage({ loadingContext })('ctp');
    const pipeImageUrl = getImage({ loadingContext, imageFolder: 'components/' })('pipe');

    return (
        <div
            className={classnames(
                'adyen_checkout-ctp__brand-wrapper',
                classNameModifiers.map(m => `adyen_checkout-ctp__brand-wrapper--${m}`)
            )}
        >
            <Img className="adyen_checkout-ctp__brand-logo" src={ctpImageUrl} alt={'Click to Pay'} />
            <Img className="adyen_checkout-ctp__brand-pipe" src={pipeImageUrl} alt="" />

            {schemes.map(brand => (
                <Img
                    key={brand}
                    className={classnames('adyen_checkout-ctp__brand-scheme', `adyen_checkout-ctp__brand-scheme-${brand}`)}
                    src={getImage({ loadingContext })(brand)}
                    alt={`Logo of ${SchemeNames[brand]}`}
                />
            ))}
        </div>
    );
};

export { CtPBrand };

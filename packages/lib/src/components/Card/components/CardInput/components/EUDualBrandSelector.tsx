import { h } from 'preact';
import { useState } from 'preact/hooks';
import classNames from 'classnames';
import { CardBrandsConfiguration, DualBrandSelectElement } from '../../../types';
import { DualBrandingChangeHandler } from './types';
import { mapDualBrandButtons } from '../utils';
import './EUDualBrandSelector.scss';

interface EUDualBrandSelectorProps {
    dualBrandingElements: DualBrandSelectElement[];
    dualBrandingChangeHandler: DualBrandingChangeHandler;
    brandsConfiguration: CardBrandsConfiguration;
}

export default function EUDualBrandSelector({
    dualBrandingElements,
    brandsConfiguration,
    dualBrandingChangeHandler
}: Readonly<EUDualBrandSelectorProps>) {
    const euDualBrandItems = mapDualBrandButtons(dualBrandingElements, brandsConfiguration);
    const [selectedBrand, setSelectedBrand] = useState<string>(euDualBrandItems[0]?.id);

    const handleBrandClick = (brandId: string) => {
        setSelectedBrand(brandId);
        dualBrandingChangeHandler(brandId);
    };

    return (
        <div className="adyen-checkout__card__eu-dual-branding">
            {euDualBrandItems.map(item => (
                <button
                    key={item.id}
                    type="button"
                    className={classNames('adyen-checkout__card__eu-dual-branding__button', {
                        'adyen-checkout__card__eu-dual-branding__button--selected': selectedBrand === item.id
                    })}
                    onClick={() => handleBrandClick(item.id)}
                    aria-label={item.altName}
                    aria-pressed={selectedBrand === item.id}
                >
                    <img src={item.imageURL} alt={item.altName} className="adyen-checkout__card__eu-dual-branding__icon" />
                </button>
            ))}
        </div>
    );
}

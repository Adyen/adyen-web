import { h } from 'preact';
import { useState } from 'preact/hooks';
import classNames from 'classnames';
import { CardBrandsConfiguration, DualBrandSelectElement } from '../../../types';
import { DualBrandingChangeHandler } from './types';
import { mapDualBrandButtons } from '../utils';
import './DualBrandSelector.scss';

interface DualBrandSelectorProps {
    dualBrandingElements: DualBrandSelectElement[];
    dualBrandingChangeHandler: DualBrandingChangeHandler;
    brandsConfiguration: CardBrandsConfiguration;
    contextualText: string;
    selectedBrandValue: string;
}

export default function DualBrandSelector({
    dualBrandingElements,
    brandsConfiguration,
    dualBrandingChangeHandler,
    contextualText,
    selectedBrandValue
}: Readonly<DualBrandSelectorProps>) {
    const dualBrandItems = mapDualBrandButtons(dualBrandingElements, brandsConfiguration);
    const [selectedBrand, setSelectedBrand] = useState<string>(selectedBrandValue);

    const handleBrandClick = (brandId: string) => {
        setSelectedBrand(brandId);
        dualBrandingChangeHandler(brandId);
    };

    return (
        <div className="adyen-checkout__card__dual-brand-selector" role="group" aria-label={contextualText}>
            {dualBrandItems.map(item => (
                <button
                    key={item.id}
                    type="button"
                    className={classNames('adyen-checkout__card__dual-brand-selector__button', {
                        'adyen-checkout__card__dual-brand-selector__button--selected': selectedBrand === item.id
                    })}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleBrandClick(item.id)}
                    aria-label={item.altName}
                    aria-pressed={selectedBrand === item.id}
                >
                    <img src={item.imageURL} alt={item.altName} className="adyen-checkout__card__dual-brand-selector__icon" />
                </button>
            ))}
        </div>
    );
}

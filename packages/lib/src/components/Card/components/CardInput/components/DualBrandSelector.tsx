import { h } from 'preact';
import { useState } from 'preact/hooks';
import classNames from 'classnames';
import { CardBrandsConfiguration, DualBrandSelectElement, DualBrandButtons, DualBrandingChangeHandler } from '../../../types';
import { mapDualBrandButtons } from '../utils';
import styles from './DualBrandSelector.module.scss';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';

interface DualBrandSelectorProps {
    dualBrandingElements: DualBrandSelectElement[];
    dualBrandingChangeHandler: DualBrandingChangeHandler;
    brandsConfiguration?: CardBrandsConfiguration;
    selectedBrandValue: string;
}

export default function DualBrandSelector({
    dualBrandingElements,
    brandsConfiguration,
    dualBrandingChangeHandler,
    selectedBrandValue
}: Readonly<DualBrandSelectorProps>) {
    const { i18n } = useCoreContext();
    const dualBrandItems = mapDualBrandButtons(dualBrandingElements, brandsConfiguration);
    const [selectedBrand, setSelectedBrand] = useState<string>(selectedBrandValue);

    const handleBrandSelect = (brandId: string) => {
        setSelectedBrand(brandId);
        dualBrandingChangeHandler(brandId);
    };

    const handleKeyDown = (e: KeyboardEvent, brandId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBrandSelect(brandId);
        }
    };

    return (
        <div className={styles.dualBrandSelector} role="group" aria-label={i18n.get('creditCard.dualBrand.description')}>
            {dualBrandItems.map((item: DualBrandButtons) => (
                <button
                    key={item.id}
                    type="button"
                    className={classNames(styles.dualBrandSelectorButton, {
                        [styles.dualBrandSelectorButtonSelected]: selectedBrand === item.id
                    })}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleBrandSelect(item.id)}
                    onKeyDown={e => handleKeyDown(e, item.id)}
                    aria-label={item.altName}
                    aria-pressed={selectedBrand === item.id}
                >
                    <img src={item.imageURL} alt={item.altName} className={styles.dualBrandSelectorIcon} />
                </button>
            ))}
        </div>
    );
}

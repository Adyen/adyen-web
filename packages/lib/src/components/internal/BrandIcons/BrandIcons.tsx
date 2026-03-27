import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import cn from 'classnames';

import { BrandIcon } from './types';
import { BrandImage } from '../BrandImage';

import styles from './BrandIcons.module.scss';

export type BrandIconsProp = {
    brandIcons: BrandIcon[];
    suffix?: string;
    maxBrandsToShow?: number;
    remainingBrandsLabel?: string;
    className?: string;
    remainingBrandsLabelClassName?: string;
    brandImageWrapperClassName?: string;
    brandImageClassName?: string;
    showIconOnError?: boolean;
    renderBrandIcon?: (brandIcon: BrandIcon) => h.JSX.Element;
};

export const BrandIcons = ({
    brandIcons,
    maxBrandsToShow = brandIcons.length,
    remainingBrandsLabel,
    className,
    remainingBrandsLabelClassName,
    brandImageClassName,
    brandImageWrapperClassName,
    showIconOnError,
    renderBrandIcon
}: Readonly<BrandIconsProp>) => {
    const visibleBrands = useMemo(() => brandIcons.slice(0, maxBrandsToShow), [brandIcons, maxBrandsToShow]);
    const remainingBrands = useMemo(() => brandIcons.slice(maxBrandsToShow), [brandIcons, maxBrandsToShow]);

    const hasRemainingBrands = Boolean(remainingBrandsLabel) || remainingBrands.length > 0;

    return (
        <div className={cn(styles.container, className)}>
            {visibleBrands.map(brandIcon =>
                renderBrandIcon ? (
                    renderBrandIcon(brandIcon)
                ) : (
                    <BrandImage
                        key={brandIcon.alt}
                        src={brandIcon.src}
                        alt={brandIcon.alt}
                        wrapperClassName={brandImageWrapperClassName}
                        imgClassName={cn(styles.img, brandImageClassName)}
                        showOnError={showIconOnError}
                    />
                )
            )}
            {hasRemainingBrands && (
                <span className={cn(styles.remainingBrandsLabel, remainingBrandsLabelClassName)}>
                    {remainingBrandsLabel || `+ ${remainingBrands.length}`}
                </span>
            )}
        </div>
    );
};

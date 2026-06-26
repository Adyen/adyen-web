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
    containerType?: 'flex' | 'grid';
    remainingBrandsLabelClassName?: string;
    brandImageWrapperClassName?: string;
    brandImageClassName?: string;
    showIconOnError?: boolean;
    smallIcons?: boolean;
    ariaHidden?: boolean;
    renderBrandIcon?: (brandIcon: BrandIcon) => h.JSX.Element;
};

export const BrandIcons = ({
    brandIcons,
    maxBrandsToShow = brandIcons.length,
    remainingBrandsLabel,
    className,
    containerType = 'flex',
    remainingBrandsLabelClassName,
    brandImageClassName,
    brandImageWrapperClassName,
    showIconOnError,
    smallIcons,
    renderBrandIcon,
    ariaHidden
}: Readonly<BrandIconsProp>) => {
    const visibleBrands = useMemo(() => brandIcons.slice(0, maxBrandsToShow), [brandIcons, maxBrandsToShow]);
    const remainingBrands = useMemo(() => brandIcons.slice(maxBrandsToShow), [brandIcons, maxBrandsToShow]);

    const hasRemainingBrands = Boolean(remainingBrandsLabel) || remainingBrands.length > 0;

    return (
        <ul
            className={cn(
                styles.container,
                { [styles.grid]: containerType === 'grid', [styles.smallImgGrid]: smallIcons && containerType === 'grid' },
                className
            )}
            aria-hidden={ariaHidden}
        >
            {visibleBrands.map(brandIcon =>
                renderBrandIcon ? (
                    renderBrandIcon(brandIcon)
                ) : (
                    <BrandImage
                        as="li"
                        key={brandIcon.alt}
                        src={brandIcon.src}
                        alt={brandIcon.alt}
                        wrapperClassName={brandImageWrapperClassName}
                        imgClassName={cn(styles.img, { [styles.smallImg]: smallIcons }, brandImageClassName)}
                        showOnError={showIconOnError}
                    />
                )
            )}
            {hasRemainingBrands && (
                <li className={cn(styles.remainingBrandsLabel, remainingBrandsLabelClassName)}>
                    {remainingBrandsLabel || `+ ${remainingBrands.length}`}
                </li>
            )}
        </ul>
    );
};

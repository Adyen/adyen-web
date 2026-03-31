import { BrandIcon } from '../../../../internal/BrandIcons/types';

export const getMaxBrandsToShow = (allowedBrands: BrandIcon[]) => (allowedBrands.length <= 4 ? undefined : 3);

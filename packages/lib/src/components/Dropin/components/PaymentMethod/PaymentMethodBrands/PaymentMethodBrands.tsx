import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';
import CompactView from './CompactView';

interface PaymentMethodBrandsProps {
    activeBrand: string;
    brands: Array<BrandConfiguration>;
    isPaymentMethodSelected: boolean;
    isCompactView?: boolean;
}

const PaymentMethodBrands = ({ activeBrand, brands, isPaymentMethodSelected, isCompactView = false }: PaymentMethodBrandsProps) => {
    if (isCompactView) {
        return <CompactView brands={brands} isPaymentMethodSelected={isPaymentMethodSelected} />;
    }

    return (
        <span className="adyen-checkout__payment-method__brands">
            {brands.map(brand => (
                <PaymentMethodIcon
                    key={brand.name}
                    altDescription={brand.name}
                    type={brand.name}
                    src={brand.icon}
                    disabled={activeBrand && activeBrand !== brand.name}
                />
            ))}
        </span>
    );
};

export default PaymentMethodBrands;

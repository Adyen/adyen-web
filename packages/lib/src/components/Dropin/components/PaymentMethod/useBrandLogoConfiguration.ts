import { useEffect, useState } from 'preact/hooks';
import UIElement from '../../../internal/UIElement/UIElement';

type BrandLogoConfiguration = {
    [key: string]: string;
};

export function useBrandLogoConfiguration(paymentMethods: UIElement[]): BrandLogoConfiguration {
    const [brandLogoConfiguration, setBrandLogoConfiguration] = useState<BrandLogoConfiguration>({});

    useEffect(() => {
        setBrandLogoConfiguration(
            paymentMethods.reduce(
                (accumulator, paymentMethod) => ({
                    ...accumulator,
                    ...(paymentMethod.props['brand'] && paymentMethod.icon && { [paymentMethod.props['brand']]: paymentMethod.icon })
                }),
                {}
            )
        );
    }, [paymentMethods]);

    return brandLogoConfiguration;
}

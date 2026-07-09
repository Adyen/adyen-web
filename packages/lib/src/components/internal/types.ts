export interface BrandConfiguration {
    name?: string;
    icon?: string;
}

export interface CardBrandsConfiguration {
    [key: string]: BrandConfiguration;
}

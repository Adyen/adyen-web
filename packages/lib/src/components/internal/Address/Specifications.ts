import { AddressSchema, AddressSpecifications } from './types';
import { ADDRESS_SPECIFICATIONS } from './constants';

class Specifications {
    private specifications: AddressSpecifications;

    constructor(specifications?) {
        this.specifications = { ...ADDRESS_SPECIFICATIONS, ...specifications };
    }

    /**
     * Checks if a certain country has a dataset.
     * @param country - The selected country
     * @returns Boolean
     */
    countryHasDataset(country: string): boolean {
        return !!this.specifications?.[country]?.hasDataset;
    }

    /**
     * Checks if a certain country has the passed field in their optional fields array.
     * @param country - The selected country
     * @param fieldName - The field to be checked
     * @returns Boolean
     */
    countryHasOptionalField(country: string, fieldName: string): boolean {
        return !!this.specifications?.[country]?.optionalFields?.includes(fieldName as any);
    }

    /**
     * Returns the address schema of the selected country or the default address schema.
     * @param country - The selected country
     * @returns AddressSchema
     */
    getAddressSchemaForCountry(country: string): AddressSchema {
        return this.specifications?.[country]?.schema || this.specifications.default.schema;
    }

    /**
     * Returns the optional fields of the selected country or the default optional fields.
     * @param country - The selected country
     * @returns Optional fields array
     */
    getOptionalFieldsForCountry(country: string): string[] {
        return this.specifications?.[country]?.optionalFields || this.specifications.default?.optionalFields || [];
    }

    /**
     * Returns the key for a field of the passed country or the default key for that field.
     * @param fieldName - The field to be searched
     * @param country - The selected country
     */
    getKeyForField(fieldName: string, country: string): string {
        return this.specifications?.[country]?.labels?.[fieldName] || fieldName;
    }

    /**
     * Returns the placeholder key for a field of the passed country or the default key for that field.
     * @param fieldName - The field to be searched
     * @param country - The selected country
     */
    getPlaceholderKeyForField(fieldName: string, country: string): string {
        return this.specifications?.[country]?.placeholders?.[fieldName] || this.specifications?.default?.placeholders?.[fieldName];
    }
}

export default Specifications;

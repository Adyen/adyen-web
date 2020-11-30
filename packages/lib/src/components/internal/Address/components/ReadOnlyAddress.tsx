import { h } from 'preact';
import Fieldset from '../../FormFields/Fieldset';
import { ReadOnlyAddressProps } from '../types';

const ReadOnlyAddress = ({ data, label }: ReadOnlyAddressProps) => {
    const { street, houseNumberOrName, city, postalCode, stateOrProvince, country } = data;

    return (
        <Fieldset classNameModifiers={[label]} label={label} readonly>
            {!!street && street}
            {houseNumberOrName && `, ${houseNumberOrName},`}
            <br />
            {postalCode && `${postalCode}`}
            {city && `, ${city}`}
            {stateOrProvince && stateOrProvince !== 'N/A' && `, ${stateOrProvince}`}
            {country && `, ${country} `}
        </Fieldset>
    );
};

export default ReadOnlyAddress;

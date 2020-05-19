import { h } from 'preact';
import Fieldset from '../../FormFields/Fieldset';

const ReadOnlyAddress = ({ data, label }) => {
    const { street, houseNumberOrName, city, postalCode, stateOrProvince, country } = data;

    return (
        <Fieldset classNameModifiers={[label]} label={label} readonly>
            {street && street}
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

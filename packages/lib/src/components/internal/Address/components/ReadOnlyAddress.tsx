import { Fragment, h } from 'preact';
import Fieldset from '../../FormFields/Fieldset';
import { ReadOnlyAddressProps } from '../types';
import { FALLBACK_VALUE } from '../constants';

const ReadOnlyAddress = ({ data, label }: ReadOnlyAddressProps) => {
    const { street, houseNumberOrName, city, postalCode, stateOrProvince, country } = data;

    return (
        <Fieldset classNameModifiers={[label]} label={label} readonly>
            <Fragment>
                {!!street && street}
                {houseNumberOrName && `, ${houseNumberOrName},`}
                <br />
                {postalCode && `${postalCode}`}
                {city && `, ${city}`}
                {stateOrProvince && stateOrProvince !== FALLBACK_VALUE && `, ${stateOrProvince}`}
                {country && `, ${country} `}
            </Fragment>
        </Fieldset>
    );
};

export default ReadOnlyAddress;

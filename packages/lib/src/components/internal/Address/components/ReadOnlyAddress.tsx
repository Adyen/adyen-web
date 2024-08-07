import { Fragment, h } from 'preact';
import Fieldset from '../../FormFields/Fieldset';
import { ReadOnlyAddressProps } from '../types';
import { FALLBACK_VALUE } from '../constants';

const FullName = ({ firstName, lastName }) => {
    return (
        <Fragment>
            {firstName && `${firstName} `}
            {lastName && `${lastName}`}
            <br />
        </Fragment>
    );
};

const ReadOnlyAddress = ({ data, label }: ReadOnlyAddressProps) => {
    const { street, houseNumberOrName, city, postalCode, stateOrProvince, country, firstName, lastName } = data;
    const hasName = firstName || lastName;

    return (
        <Fieldset classNameModifiers={[label]} label={label} readonly>
            <Fragment>
                {hasName && <FullName firstName={firstName} lastName={lastName}></FullName>}
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

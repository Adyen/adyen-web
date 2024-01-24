import { Fragment, h } from 'preact';
import Fieldset from '../../FormFields/Fieldset';
import { ReadOnlyAddressProps } from '../types';
import { FALLBACK_VALUE } from '../constants';

const ReadOnlyAddress = ({ data, label }: ReadOnlyAddressProps) => {
    const { street, houseNumberOrName, city, postalCode, stateOrProvince, country, firstName, lastName } = data;
    const hasName = firstName || lastName;
    const FullName = ({ firstName, lastName }) => {
        return (
            <Fragment>
                {firstName && `${firstName} `}
                {lastName && `${lastName}`}
                <br />
            </Fragment>
        );
    };
    return (
        <Fieldset classNameModifiers={[label]} label={label} readonly>
            {hasName && <FullName firstName={firstName} lastName={lastName}></FullName>}
            {!!street && street}
            {houseNumberOrName && `, ${houseNumberOrName},`}
            <br />
            {postalCode && `${postalCode}`}
            {city && `, ${city}`}
            {stateOrProvince && stateOrProvince !== FALLBACK_VALUE && `, ${stateOrProvince}`}
            {country && `, ${country} `}
        </Fieldset>
    );
};

export default ReadOnlyAddress;

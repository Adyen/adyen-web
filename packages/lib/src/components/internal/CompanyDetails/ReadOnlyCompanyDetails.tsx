import { h } from 'preact';
import Fieldset from '../FormFields/Fieldset';
import { ReadOnlyCompanyDetailsProps } from './types';

const ReadOnlyCompanyDetails = ({ data }) => {
    const { name, registrationNumber }: ReadOnlyCompanyDetailsProps = data;

    return (
        <Fieldset classNameModifiers={['companyDetails']} label="companyDetails" readonly>
            {name && `${name} `}
            {registrationNumber && `${registrationNumber} `}
        </Fieldset>
    );
};

export default ReadOnlyCompanyDetails;

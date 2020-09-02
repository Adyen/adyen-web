import { h, Fragment } from 'preact';
import Fieldset from '../FormFields/Fieldset';
import { ReadOnlyPersonalDetailsProps } from './types';

const ReadOnlyPersonalDetails = ({ data }) => {
    const { firstName, lastName, shopperEmail, telephoneNumber }: ReadOnlyPersonalDetailsProps = data;

    return (
        <Fieldset classNameModifiers={['personalDetails']} label="personalDetails" readonly>
            {firstName && `${firstName} `}
            {lastName && `${lastName} `}
            {shopperEmail && (
                <Fragment>
                    <br />
                    {shopperEmail}
                </Fragment>
            )}
            {telephoneNumber && (
                <Fragment>
                    <br />
                    {telephoneNumber}
                </Fragment>
            )}
        </Fieldset>
    );
};

export default ReadOnlyPersonalDetails;

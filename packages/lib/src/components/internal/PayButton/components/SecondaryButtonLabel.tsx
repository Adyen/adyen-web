import { h } from 'preact';
import './SecondaryButtonLabel.scss';

const SecondaryButtonLabel = ({ label }) => {
    return <span className={'checkout-secondary-button__text'}>{label}</span>;
};

export default SecondaryButtonLabel;

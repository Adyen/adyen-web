import { h } from 'preact';
import Img from '../../Img';
import './IssuerButton.scss';

interface IssuerButtonProps {
    name: string;
    id: string;
    selected: boolean;
    icon?: string;
}

function IssuerButton({ name, id, icon, selected = false }: IssuerButtonProps) {
    return (
        <button className="adyen-checkout__issuer-button" aria-label={name} aria-pressed={selected}>
            <span className="adyen-checkout__issuer-button-text">{name}</span>
            {icon && <Img className="adyen-checkout__issuer-button-img" alt={name} src={icon} />}
        </button>
    );
}

export default IssuerButton;

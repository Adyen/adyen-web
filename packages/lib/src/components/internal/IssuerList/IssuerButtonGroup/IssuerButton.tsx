import { h } from 'preact';
import cx from 'classnames';
import Img from '../../Img';
import './IssuerButton.scss';

interface IssuerButtonProps {
    name: string;
    id: string;
    selected: boolean;
    onClick: (event: UIEvent) => void;
    icon?: string;
}

function IssuerButton({ name, id, icon, onClick, selected = false }: IssuerButtonProps) {
    return (
        <button
            type="button"
            className={cx('adyen-checkout__issuer-button', { 'adyen-checkout__issuer-button--selected': selected })}
            aria-label={name}
            aria-pressed={selected}
            onClick={onClick}
            value={id}
        >
            {!!icon && <Img className="adyen-checkout__issuer-button-img" alt={name} src={icon} />}
            <span className="adyen-checkout__issuer-button-text">{name}</span>
        </button>
    );
}

export default IssuerButton;

import { h } from 'preact';
import IssuerButton from './IssuerButton';
import './IssuerButtonGroup.scss';
import useCoreContext from '../../../../core/Context/useCoreContext';

interface IssuerButtonGroupProps {
    options: IssuerItem[];
}

interface IssuerItem {
    id: string;
    name: string;
    icon?: string;
}

const IssuerButtonGroup = ({ options = [] }: IssuerButtonGroupProps) => {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-checkout__issuer-button-group" role="group" aria-label={i18n.get('idealIssuer.selectField.placeholder')}>
            {options.map(issuer => (
                <IssuerButton key={issuer.id} {...issuer} selected={false} />
            ))}
        </div>
    );
};

export default IssuerButtonGroup;

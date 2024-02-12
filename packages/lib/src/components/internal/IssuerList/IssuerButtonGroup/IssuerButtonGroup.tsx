import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import IssuerButton from './IssuerButton';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './IssuerButtonGroup.scss';
import { IssuerItem } from '../types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';
import { ANALYTICS_FEATURED_ISSUER, ANALYTICS_SELECTED_STR } from '../../../../core/Analytics/constants';

interface IssuerButtonGroupProps {
    items: IssuerItem[];
    selectedIssuerId: string;
    onChange: (event: UIEvent) => void;
    onSubmitAnalytics: (aObj: SendAnalyticsObject) => void;
}

const IssuerButtonGroup = ({ items = [], selectedIssuerId, onChange, onSubmitAnalytics }: IssuerButtonGroupProps) => {
    const { i18n } = useCoreContext();

    const handleClick = useCallback(
        (event: UIEvent) => {
            const value = (event.currentTarget as HTMLButtonElement).value;
            Object.defineProperty(event.target, 'value', { value });

            const issuerObj = items.find(issuer => issuer.id === value);
            onSubmitAnalytics({ type: ANALYTICS_SELECTED_STR, target: ANALYTICS_FEATURED_ISSUER, issuer: issuerObj.name });

            onChange(event);
        },
        [onChange]
    );

    return (
        <div className="adyen-checkout__issuer-button-group" role="group" aria-label={i18n.get('idealIssuer.selectField.placeholder')}>
            {items.map(issuer => (
                <IssuerButton key={issuer.id} {...issuer} selected={selectedIssuerId === issuer.id} onClick={handleClick} />
            ))}
        </div>
    );
};

export default IssuerButtonGroup;

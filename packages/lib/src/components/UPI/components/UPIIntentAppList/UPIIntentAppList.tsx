import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { apiId } from '../../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import RadioButton from '../../../internal/RadioButton';
import uuidv4 from '../../../../utils/uuid';
import './UPIIntentAppList.scss';

interface UPIIntentAppListProps {
    appIds: Array<apiId>;
    onSelect?: Function;
}

const UPIIntentAppList = ({ appIds, onSelect = () => {} }: UPIIntentAppListProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const [selectedAppId, setSelectedAppId] = useState('');
    const handleAppItemSelected = ({ id }) => {
        setSelectedAppId(id);
        onSelect(id);
    };

    return (
        <ul className="adyen-checkout-upi-app-list" role="radiogroup" aria-label={i18n.get('paymentMethodsList.aria.label')} required>
            {appIds.map(app => {
                const uniqueId = `${app.id}-${uuidv4()}`;
                const itemKey = `app-list-item-${uniqueId}`;
                const buttonId = `radio-button-${uniqueId}`;

                return (
                    <li
                        key={itemKey}
                        className="adyen-checkout-upi-app-item"
                        role="button"
                        aria-expanded="false"
                        onClick={() => handleAppItemSelected(app)}
                    >
                        <RadioButton buttonId={buttonId} isSelected={selectedAppId === app.id}>
                            <label htmlFor={buttonId}>{app.name}</label>
                        </RadioButton>
                    </li>
                );
            })}
        </ul>
    );
};

export default UPIIntentAppList;

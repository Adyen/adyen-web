import { h } from 'preact';
import { useState } from 'preact/hooks';
import { ApiId, UpiMode } from '../../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import uuid from '../../../../utils/uuid';
import './UPIIntentAppList.scss';
import UPIIntentAppItem from './UPIIntentAppItem';
import VpaInput from '../VpaInput';

interface UPIIntentAppListProps {
    appIds: Array<ApiId>;
    onSelect?: Function;
}

const UPIIntentAppList = ({ appIds, onSelect = () => {} }: UPIIntentAppListProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const [selectedAppId, setSelectedAppId] = useState<string>('');
    const handleAppItemSelected = (id: string) => {
        setSelectedAppId(id);
        onSelect(id);
    };

    return (
        <ul className="adyen-checkout-upi-app-list" role="radiogroup" aria-label={i18n.get('paymentMethodsList.aria.label')} required>
            {appIds.map((appId, index, array) => {
                const _id = `adyen-checkout-upi-${appId.id}-${uuid()}`;
                const isSelected = selectedAppId === appId.id;
                const next = array[index + 1];
                const isNextSelected = selectedAppId === next?.id;
                const showOtherUpi = appId.id === UpiMode.Intent;
                return (
                    <UPIIntentAppItem
                        key={`adyen-checkout-upi-app-item-${_id}`}
                        appId={appId}
                        isSelected={isSelected}
                        isNextSelected={isNextSelected}
                        onSelect={handleAppItemSelected}
                    >
                        {showOtherUpi && <VpaInput onChange={() => {}} onSetInputHandlers={() => {}} />}
                    </UPIIntentAppItem>
                );
            })}
        </ul>
    );
};

export default UPIIntentAppList;

import { h } from 'preact';
import { AppId, UpiMode } from '../../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import UPIIntentAppItem from './UPIIntentAppItem';
import VpaInput from '../VpaInput';
import { OnChangeProps, VpaInputHandlers } from '../VpaInput/VpaInput';
import useImage from '../../../../core/Context/useImage';
import './UPIIntentAppList.scss';

interface UPIIntentAppListProps {
    appIds: Array<AppId>;
    selectedAppId?: string;
    onAppSelect?: Function;
    onVpaInputChange?({ data, valid, errors, isValid }: OnChangeProps): void;
    onSetInputHandlers?(handlers: VpaInputHandlers): void;
}

const UPIIntentAppList = ({
    appIds,
    selectedAppId,
    onAppSelect = () => {},
    onVpaInputChange = () => {},
    onSetInputHandlers = () => {}
}: UPIIntentAppListProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <ul className="adyen-checkout-upi-app-list" role="radiogroup" aria-label={i18n.get('paymentMethodsList.aria.label')} required>
            {appIds.map((appId, index, array) => {
                const _id = `adyen-checkout-upi-${appId.id}}`;
                const isSelected = selectedAppId === appId.id;
                const next = array[index + 1];
                const isNextSelected = selectedAppId === next?.id;
                const showUpiCollectInput = appId.id === UpiMode.Collect;
                const imgPathConfig = showUpiCollectInput ? {} : { subFolder: 'upi/' };
                const imgName = showUpiCollectInput ? 'upi' : appId.id;
                const imgSrc = getImage(imgPathConfig)(imgName);
                return (
                    <UPIIntentAppItem
                        key={`adyen-checkout-upi-app-item-${_id}`}
                        appId={appId}
                        imgSrc={imgSrc}
                        isSelected={isSelected}
                        isNextSelected={isNextSelected}
                        onSelect={onAppSelect}
                    >
                        {showUpiCollectInput && <VpaInput onChange={onVpaInputChange} onSetInputHandlers={onSetInputHandlers} />}
                    </UPIIntentAppItem>
                );
            })}
        </ul>
    );
};

export default UPIIntentAppList;

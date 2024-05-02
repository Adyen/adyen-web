import { h } from 'preact';
import { App, UpiMode } from '../../types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import UPIIntentAppItem from './UPIIntentAppItem';
import VpaInput from '../VpaInput';
import { OnChangeProps, VpaInputHandlers } from '../VpaInput/VpaInput';
import useImage from '../../../../core/Context/useImage';
import './UPIIntentAppList.scss';

interface UPIIntentAppListProps {
    apps: Array<App>;
    selectedAppId?: string;
    disabled?: boolean;
    onAppSelect?: Function;
    onVpaInputChange?({ data, valid, errors, isValid }: OnChangeProps): void;
    onSetInputHandlers?(handlers: VpaInputHandlers): void;
}

const UPIIntentAppList = ({
    apps,
    selectedAppId,
    disabled,
    onAppSelect = () => {},
    onVpaInputChange = () => {},
    onSetInputHandlers = () => {}
}: UPIIntentAppListProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <ul className="adyen-checkout-upi-app-list" role="radiogroup" aria-label={i18n.get('paymentMethodsList.aria.label')} required>
            {apps.map(app => {
                const key = `adyen-checkout-upi-app-item-${app.id}}`;
                const isSelected = selectedAppId === app.id;

                const showUpiCollectInput = app.id === UpiMode.Vpa;
                const imgName = showUpiCollectInput ? 'upi' : app.id;
                const imgSrc = getImage()(imgName.toLowerCase());

                return (
                    <UPIIntentAppItem key={key} app={app} imgSrc={imgSrc} isSelected={isSelected} onSelect={onAppSelect}>
                        {showUpiCollectInput && <VpaInput disabled={disabled} onChange={onVpaInputChange} onSetInputHandlers={onSetInputHandlers} />}
                    </UPIIntentAppItem>
                );
            })}
        </ul>
    );
};

export default UPIIntentAppList;

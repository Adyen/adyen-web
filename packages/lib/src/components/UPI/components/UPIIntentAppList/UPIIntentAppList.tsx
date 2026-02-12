import { h } from 'preact';
import classNames from 'classnames';
import { App } from '../../types';
import UPIIntentAppItem from './UPIIntentAppItem';
import useImage from '../../../../core/Context/useImage';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import './UPIIntentAppList.scss';

interface UPIIntentAppListProps {
    apps: Array<App>;
    selectedAppId?: string;
    disabled?: boolean;
    onAppSelect?: (app: App) => void;
}

const UPIIntentAppList = ({ apps, selectedAppId, disabled, onAppSelect = () => {} }: UPIIntentAppListProps): h.JSX.Element => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        /* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
        <ul
            className={classNames({
                'adyen-checkout-upi-app-list': true,
                'adyen-checkout-upi-app-list--loading': disabled
            })}
            role="radiogroup"
            aria-label={i18n.get('paymentMethodsList.aria.label')}
        >
            {apps.map(app => {
                const key = `adyen-checkout-upi-app-item-${app.id}`;
                const isSelected = selectedAppId === app.id;
                const imgName = `upi/${app.id}`;
                const imgSrc = getImage()(imgName.toLowerCase());
                return <UPIIntentAppItem key={key} app={app} imgSrc={imgSrc} isSelected={isSelected} onSelect={onAppSelect} />;
            })}
        </ul>
    );
};

export default UPIIntentAppList;

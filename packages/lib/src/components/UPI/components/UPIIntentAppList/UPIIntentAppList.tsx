import { h } from 'preact';
import classNames from 'classnames';
import { App, UPIAppList } from '../../types';
import UPIIntentAppItem from './UPIIntentAppItem';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import './UPIIntentAppList.scss';

interface UPIIntentAppListProps {
    appsList: UPIAppList;
    selectedAppId?: string;
    disabled?: boolean;
    onAppSelect: (app: App) => void;
}

const UPIIntentAppList = ({ appsList, selectedAppId, disabled, onAppSelect }: Readonly<UPIIntentAppListProps>): h.JSX.Element => {
    const { i18n } = useCoreContext();

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
            {appsList.map(app => {
                const key = `adyen-checkout-upi-app-item-${app.id}`;
                const isSelected = selectedAppId === app.id;
                return (
                    <UPIIntentAppItem
                        key={key}
                        app={{ id: app.id, name: app.name }}
                        imgSrc={app.icon}
                        isSelected={isSelected}
                        onSelect={onAppSelect}
                    />
                );
            })}
        </ul>
    );
};

export default UPIIntentAppList;

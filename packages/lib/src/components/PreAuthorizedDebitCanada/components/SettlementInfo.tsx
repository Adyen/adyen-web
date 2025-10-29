import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Alert from '../../internal/Alert';

export const SettlementInfo = () => {
    const { i18n } = useCoreContext();

    return (
        <Alert classNames={['adyen-checkout__eftpad-canada-info']} icon="info_black" type="info">
            <div>{i18n.get('eftpad-canada.settlement-info')}</div>
        </Alert>
    );
};

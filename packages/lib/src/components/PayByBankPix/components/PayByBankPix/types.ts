import { PayByBankPixConfiguration } from '../../types';
import { OnChangeData } from '../../../../core/types';

export interface PayByBankPixProps extends PayByBankPixConfiguration {
    txVariant?: string;
    setComponentRef?: (ref) => void;
    onChange?(payload: OnChangeData): void;
}

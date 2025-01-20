import { PayByBankPixConfiguration } from '../../types';

export interface PayByBankPixProps extends PayByBankPixConfiguration {
    setComponentRef?: (ref) => void;
}

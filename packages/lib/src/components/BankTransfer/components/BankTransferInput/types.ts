import { BankTransferSchema } from '../../types';
import { ValidationRuleResult } from '../../../../utils/Validator/ValidationRuleResult';

type BankTransferInputData = {
    shopperEmail: string;
};

export interface BankTransferInputProps {
    onChange: (onChangeProps: {
        data: BankTransferSchema;
        errors: { [p: string]: ValidationRuleResult };
        valid: { [p: string]: boolean };
        isValid: boolean;
    }) => void;
    data?: BankTransferInputData;
    setComponentRef: (ref: any) => void;
    showContextualElement?: boolean;
    contextualText?: string;
}

import { ValidationResult } from '../../components/internal/PersonalDetails/types';
import { ValidatorRules } from '../Validator/types';

export type FormState<DataState> = {
    schema: string[];
    data: DataState;
    errors: {
        [key: string]: ValidationResult;
    };
    valid: {
        [key: string]: boolean;
    };
};

export type FormProps = {
    rules?: ValidatorRules;
    [key: string]: any;
};

export type DefaultDataState = {
    [key: string]: any;
};

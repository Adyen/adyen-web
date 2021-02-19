import { ValidationResult } from '../../components/internal/PersonalDetails/types';

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

export type DefaultDataState = {
    [key: string]: any;
};

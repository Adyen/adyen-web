import { ValidationRuleResult } from './ValidationRuleResult';
import { Formatter } from '../useForm/types';

export type ValidatorMode = 'blur' | 'input';

export type ErrorMessageObject = {
    translationKey: string;
    translationObject: any;
};

export type Ruleset = {
    [key: string]: any;
};

export type CountryRuleset = {
    [country: string]: Ruleset;
};

export type FormatRules = { [field: string]: Formatter };

export type CountryFormatRules = { [country: string]: FormatRules };

export type ValidateFunction = (value: string, context) => boolean;

export interface ValidatorRule {
    validate: ValidateFunction;
    errorMessage?: string | ErrorMessageObject;
    modes: ValidatorMode[];
}

export type ValidatorRules = { [field: string]: ValidatorRule | ValidatorRule[] };

export type CountryBasedValidatorRules = { [country: string]: ValidatorRules };

export interface FieldData {
    key: string;
    value: string;
    mode?: ValidatorMode;
}

export interface FieldContext {
    state: {
        [key: string]: any;
    };
}

export type ValidationRuleResults = { [key: string]: ValidationRuleResult };

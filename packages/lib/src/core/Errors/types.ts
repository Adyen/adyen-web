import { ValidationRuleResult } from '../../utils/Validator/ValidationRuleResult';
import { SFError } from '../../components/Card/components/CardInput/types';
import Language from '../../language';
import { StringObject } from '../../components/internal/Address/types';

export interface ErrorObj {
    // Describes an object with unknown keys whose value is always a ValidationRuleResult or FieldError
    [key: string]: ValidationRuleResult | SFError;
}

export interface SortErrorsObj {
    errors: ErrorObj;
    layout?: string[];
    i18n: Language;
    countrySpecificLabels?: StringObject;
    fieldTypeMappingFn?: (key: string, i18n: Language, countrySpecificLabels: StringObject) => string;
}

export interface SortedErrorObject {
    field: string;
    errorMessage: string;
    errorCode: string;
}

export interface SRPanelProps {
    id?: string;
    showPanel?: boolean;
    ref?: any;
}

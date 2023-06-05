import { ValidationRuleResult } from '../../utils/Validator/ValidationRuleResult';
import { SFError } from '../../components/Card/components/CardInput/types';
import Language from '../../language';
import { StringObject } from '../../components/internal/Address/types';
import { BaseElementProps } from '../../components/types';

export interface ErrorObj {
    // Describes an object with unknown keys whose value is always a ValidationRuleResult or FieldError
    [key: string]: ValidationRuleResult | SFError;
}

export interface ValidationRuleErrorObj {
    // Describes an object with unknown keys whose value is always a ValidationRuleResult
    [key: string]: ValidationRuleResult;
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

export interface AriaAttributes {
    'aria-relevant'?: 'additions' | 'all' | 'removals' | 'text' | 'additions text';
    'aria-live'?: 'off' | 'polite' | 'assertive';
    'aria-atomic'?: 'true' | 'false';
}

export interface SRPanelProps extends BaseElementProps {
    enabled?: boolean;
    node?: string;
    showPanel?: boolean;
    moveFocus?: boolean;
    id?: string;
    ariaAttributes?: AriaAttributes;
}

export interface SRMessagesProps {
    setComponentRef: (ref: any) => void;
}

export interface GenericError {
    isValid: boolean;
    errorMessage: string; // needed for the SRPanel
    error: string; // needed for the visual error
}

export interface SetSRMessagesReturnObject {
    currentErrorsSortedByLayout: SortedErrorObject[];
    action: string;
    fieldToFocus?: string;
}

export type ErrorObject = {
    success: false;
    error: string;
};

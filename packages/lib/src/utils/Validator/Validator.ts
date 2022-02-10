import { email } from '../regex';
import { ErrorMessageObject, FieldContext, FieldData, ValidatorRule, ValidatorRules } from './types';

/**
 * Holds the result of a validation
 */
export class ValidationRuleResult {
    private readonly shouldValidate: boolean;
    public isValid: boolean;
    public errorMessage: string | ErrorMessageObject;

    constructor(rule, value, mode, context) {
        this.shouldValidate = rule.modes.includes(mode);
        this.isValid = rule.validate(value, context);
        this.errorMessage = rule.errorMessage;
    }

    /**
     * Whether the validation is considered an error.
     * A field is only considered to be an error if the validation rule applies to the current mode.
     */
    hasError(): boolean {
        return !this.isValid && this.shouldValidate;
    }
}

class ValidationResult {
    private validationResults: ValidationRuleResult[];

    constructor(results: ValidationRuleResult[]) {
        this.validationResults = results;
    }

    /** Checks if all validation rules have passed */
    get isValid(): boolean {
        return this.validationResults.every(result => result.isValid);
    }

    /** Checks if any validation rule returned an error */
    hasError(): boolean {
        return Boolean(this.getError());
    }

    /** Returns the first validation result that returned an error */
    getError() {
        return this.validationResults.find(result => result.hasError());
    }

    /** Returns all validation results that returned an error */
    getAllErrors() {
        return this.validationResults.filter(result => result.hasError());
    }
}

class Validator {
    public rules: ValidatorRules = {
        shopperEmail: {
            validate: value => email.test(value),
            errorMessage: 'error.va.gen.01',
            modes: ['blur']
        },
        default: {
            validate: () => true,
            modes: ['blur', 'input']
        }
    };

    constructor(rules = {}) {
        this.setRules(rules);
    }

    setRules(newRules) {
        this.rules = {
            ...this.rules,
            ...newRules
        };
    }

    /**
     * Get all validation rules for a field
     */
    private getRulesFor(field: string): ValidatorRule[] {
        let fieldRules: ValidatorRule | ValidatorRule[] = this.rules[field] ?? this.rules['default'];

        if (!Array.isArray(fieldRules)) {
            fieldRules = [fieldRules];
        }

        return fieldRules;
    }

    /**
     * Validates a field
     */
    validate({ key, value, mode = 'blur' }: FieldData, context?: FieldContext) {
        const fieldRules = this.getRulesFor(key);
        const validationRulesResult = fieldRules.map(rule => new ValidationRuleResult(rule, value, mode, context));

        return new ValidationResult(validationRulesResult);
    }
}

export default Validator;

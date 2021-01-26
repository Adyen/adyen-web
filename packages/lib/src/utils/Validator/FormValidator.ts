type ValidatorMode = 'blur' | 'input';

export interface ValidatorRule {
    validate: (value) => boolean;
    errorMessage?: string;
    modes: ValidatorMode[];
}

export type ValidatorRules = { [field: string]: ValidatorRule | ValidatorRule[] };

/**
 * Holds the result of a validation
 */
class ValidationRuleResult {
    private readonly shouldValidate: boolean;
    public isValid: boolean;
    public errorMessage: string;

    constructor(rule, value, mode) {
        this.shouldValidate = rule.modes.includes(mode);
        this.isValid = rule.validate(value);
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
        return this.validationResults.reduce((acc, result) => acc && result.isValid, true);
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
            validate: email => /\S+@\S+\.\S+/.test(email),
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
    validate(field, value, mode: ValidatorMode = 'blur') {
        const fieldRules = this.getRulesFor(field);
        const validationRulesResult = fieldRules.map(rule => new ValidationRuleResult(rule, value, mode));

        return new ValidationResult(validationRulesResult);
    }
}

export default Validator;

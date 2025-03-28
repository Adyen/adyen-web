import { ValidatorRules, ValidatorRule, FieldContext, FieldData } from './types';
import { ValidationRuleResult } from './ValidationRuleResult';

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
    hasError(isValidatingForm = false): boolean {
        return Boolean(this.getError(isValidatingForm));
    }

    /** Returns the first validation result that returned an error */
    getError(isValidatingForm = false) {
        return this.validationResults.find(result => result.hasError(isValidatingForm));
    }

    /** Returns all validation results that returned an error */
    getAllErrors() {
        return this.validationResults.filter(result => result.hasError());
    }
}

class Validator {
    public rules: ValidatorRules = {
        default: {
            validate: () => true,
            modes: ['blur', 'input']
        }
    };

    constructor(rules) {
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
        // create an ValidationRuleResult, we run the actual validation inside of it
        // validate is called in the constructor of ValidationRuleResult
        // line rule.validate(value, context);
        //
        const validationRulesResult = fieldRules.map(rule => new ValidationRuleResult(rule, value, mode, context));

        return new ValidationResult(validationRulesResult);
    }
}

export default Validator;

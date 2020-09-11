import defaultRules from './defaultRules';

class Validator {
    constructor(rules = {}) {
        this.setRules(rules);
    }

    public rules = defaultRules;

    setRules(newRules) {
        this.rules = {
            input: { ...(this.rules && this.rules.input), ...(newRules && newRules.input) },
            blur: { ...(this.rules && this.rules.blur), ...(newRules && newRules.blur) }
        };
    }

    validate(field, mode = 'blur') {
        return value => {
            const fieldRule = this.rules[mode][field] ? field : 'default';
            return this.rules[mode][fieldRule](value);
        };
    }
}

export default Validator;

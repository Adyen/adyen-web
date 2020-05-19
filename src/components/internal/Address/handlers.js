import { COUNTRIES_WITH_STATES_DATASET } from './constants';

export function handleChange(e) {
    const field = e.target;
    const { name, value, optional } = field;
    const isValid = !optional && !!value;
    const hasError = this.state.showValidation && !isValid;

    this.setState(
        prevState => ({
            data: { ...prevState.data, [name]: value },
            valid: { ...prevState.valid, [name]: isValid },
            errors: { ...prevState.errors, [name]: hasError }
        }),
        this.validateAddress
    );
}

export function handleStateChange(e) {
    const field = e.currentTarget;
    const value = field.getAttribute('data-value');

    this.setState(
        prevState => ({
            data: { ...prevState.data, stateOrProvince: value },
            valid: { ...prevState.valid, stateOrProvince: !!value },
            errors: { ...prevState.errors, stateOrProvince: !value }
        }),
        this.validateAddress
    );
}

export function handleCountryChange(e) {
    const field = e.currentTarget;
    const value = field.getAttribute('data-value');

    this.setState(
        prevState => ({
            data: { ...prevState.data, country: value, stateOrProvince: COUNTRIES_WITH_STATES_DATASET.includes(value) ? '' : 'N/A' },
            valid: { ...prevState.valid, country: !!value },
            errors: { ...prevState.errors, country: !value }
        }),
        this.validateAddress
    );
}

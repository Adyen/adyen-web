import { h } from 'preact';
import './FormInstruction.scss';
import { useCoreContext } from '../../../core/Context/CoreProvider';

const FormInstruction = () => {
    const { i18n } = useCoreContext();
    return <p className="adyen-checkout-form-instruction">{i18n.get('form.instruction')}</p>;
};

export default FormInstruction;

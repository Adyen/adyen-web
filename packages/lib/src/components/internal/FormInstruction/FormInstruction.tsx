import { h } from 'preact';
import './FormInstruction.scss';
import useCoreContext from '../../../core/Context/useCoreContext';

const FormInstruction = () => {
    const { i18n } = useCoreContext();
    return <span className="adyen-checkout-form-instruction">{i18n.get('form.instruction')}</span>;
};

export default FormInstruction;

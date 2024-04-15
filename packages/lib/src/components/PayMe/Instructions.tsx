import { useCoreContext } from '../../core/Context/CoreProvider';
import { h } from 'preact';
import './Instructions.scss';

export default function Instructions() {
    const { i18n } = useCoreContext();
    const steps = i18n.get('payme.instructions.steps');
    const footnote = i18n.get('payme.instructions.footnote');

    return (
        <div className="adyen-checkout-payme-instructions">
            <ol className="adyen-checkout-payme-instructions__steps">
                {steps.split('%@').map((step, index) => (
                    <li key={`instruction-${index}`}>{step}</li>
                ))}
            </ol>
            <span>{footnote}</span>
        </div>
    );
}

import { h } from 'preact';
import './Spinner.scss';

interface SpinnerProps {
    /**
     * Whether the spinner should be rendered inline
     */
    inline?: boolean;

    /**
     * size of the spinner (small/medium/large)
     */
    size?: string;
}

/**
 * Default Loading Spinner
 * @param props -
 */
const Spinner = ({ inline = false, size = 'large' }: SpinnerProps) => (
    <div data-testid="spinner" className={`adyen-checkout__spinner__wrapper ${inline ? 'adyen-checkout__spinner__wrapper--inline' : ''}`}>
        <div className={`adyen-checkout__spinner adyen-checkout__spinner--${size}`} />
    </div>
);

export default Spinner;

import { h } from 'preact';
import './Spinner.scss';

interface SpinnerProps {
    inline?: boolean;
    size?: string;
}

/**
 * Default Loading Spinner
 * @param {Object} props
 * @param {boolean} props.inline - whether the spinner should be rendered inline
 * @param {string} props.size - size of the spinner (small/medium/large)
 */
const Spinner = ({ inline = false, size = 'large' }: SpinnerProps) => (
    <div className={`adyen-checkout__spinner__wrapper ${inline ? 'adyen-checkout__spinner__wrapper--inline' : ''}`}>
        <div className={`adyen-checkout__spinner adyen-checkout__spinner--${size}`} />
    </div>
);

export default Spinner;

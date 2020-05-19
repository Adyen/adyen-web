import { h } from 'preact';
import PayButton from '../internal/PayButton';

/**
 * withPayButton: A higher order function which adds the payButton method
 * @extends UIElement
 */
const withPayButton = Element =>
    class ElementWithPayButton extends Element {
        public payButton = props => <PayButton {...props} amount={this.props.amount} onClick={this.submit} />;
    };

export default withPayButton;

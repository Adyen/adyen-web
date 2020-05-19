import { Component, h } from 'preact';

class SelectListItem extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        e.preventDefault();
        this.props.onChange(this.props.item);
    }

    render({ item, selected }) {
        const className = `adyen-checkout__select-list__item ${selected ? 'adyen-checkout__select-list__item--selected' : ''}`;
        return (
            <li className={className} onClick={this.handleClick}>
                {item.displayName}
            </li>
        );
    }
}

export default SelectListItem;

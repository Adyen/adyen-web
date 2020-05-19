import { Component, h } from 'preact';
import SelectListItem from './SelectListItem';
import './SelectList.scss';

class SelectList extends Component {
    constructor(props) {
        super(props);

        this.setState({ selected: this.props.selected });
        this.handleSelect = this.handleSelect.bind(this);
    }

    static defaultProps = {
        selected: {},
        onChange: () => {}
    };

    handleSelect(item) {
        this.setState({ selected: item });
        this.props.onChange(item);
    }

    render({ items = [], optional = false, ...props }) {
        return (
            <ul className="adyen-checkout__select-list" {...props} required={!optional}>
                {items.map(item => (
                    <SelectListItem
                        key={item.id}
                        item={item}
                        selected={this.state.selected.id === item.id}
                        onChange={this.handleSelect}
                        onClick={this.handleClick}
                    />
                ))}
            </ul>
        );
    }
}

export default SelectList;

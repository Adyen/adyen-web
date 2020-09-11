import { Component, h } from 'preact';
import cx from 'classnames';
import styles from './Select.module.scss';
import './Select.scss';
import { SelectProps, SelectState } from './types';

class Select extends Component<SelectProps, SelectState> {
    private selectContainer;
    private toggleButton;
    private dropdownList;

    public static defaultProps = {
        items: [],
        readonly: false,
        onChange: () => {}
    };

    constructor(props) {
        super(props);

        this.state = {
            toggleDropdown: false
        };

        this.toggle = this.toggle.bind(this);
        this.select = this.select.bind(this);
        this.closeDropdown = this.closeDropdown.bind(this);
        this.handleButtonKeyDown = this.handleButtonKeyDown.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleOnError = this.handleOnError.bind(this);
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, false);
    }

    handleClickOutside(e) {
        if (!this.selectContainer.contains(e.target)) {
            this.setState({ toggleDropdown: false });
        }
    }

    toggle(e) {
        e.preventDefault();
        this.setState({ toggleDropdown: !this.state.toggleDropdown });
    }

    select(e) {
        e.preventDefault();
        this.closeDropdown();
        this.props.onChange(e);
    }

    /**
     * Closes the dropdown and focuses the button element
     */
    closeDropdown() {
        this.setState({ toggleDropdown: false }, () => this.toggleButton.focus());
    }

    /**
     * Handle keyDown events on the adyen-checkout__dropdown__element
     * Navigates through the list, or select an element, or close the menu.
     * @param e - KeyDownEvent
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.setState({ toggleDropdown: false });
                break;
            case ' ': // space
            case 'Enter':
                this.select(e);
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (e.target.nextElementSibling) e.target.nextElementSibling.focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (e.target.previousElementSibling) e.target.previousElementSibling.focus();
                break;
            default:
        }
    }

    /**
     * Handle keyDown events on the adyen-checkout__dropdown__button
     * Opens the dropdownList and focuses the first element if available
     * @param e - KeyDownEvent
     */
    handleButtonKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case ' ': // space
            case 'Enter':
                e.preventDefault();
                this.setState({ toggleDropdown: true });
                if (this.dropdownList?.firstElementChild) {
                    this.dropdownList.firstElementChild.focus();
                }
                break;
            default:
        }
    }

    handleOnError(e) {
        e.target.style.cssText = 'display: none';
    }

    render({ className = '', classNameModifiers = [], isInvalid, items = [], placeholder, readonly, selected }, { toggleDropdown }) {
        const active = items.find(i => i.id === selected) || {};

        return (
            <div
                className={cx([
                    'adyen-checkout__dropdown',
                    styles['adyen-checkout__dropdown'],
                    className,
                    ...classNameModifiers.map(m => `adyen-checkout__dropdown--${m}`)
                ])}
                ref={ref => {
                    this.selectContainer = ref;
                }}
            >
                <button
                    type="button"
                    className={cx([
                        'adyen-checkout__dropdown__button',
                        styles['adyen-checkout__dropdown__button'],
                        {
                            'adyen-checkout__dropdown__button--readonly': readonly,
                            'adyen-checkout__dropdown__button--active': toggleDropdown,
                            [styles['adyen-checkout__dropdown__button--active']]: toggleDropdown,
                            'adyen-checkout__dropdown__button--invalid': isInvalid
                        }
                    ])}
                    onClick={!readonly ? this.toggle : undefined}
                    onKeyDown={!readonly ? this.handleButtonKeyDown : undefined}
                    tabIndex={0}
                    title={active.name || placeholder}
                    aria-haspopup="listbox"
                    aria-expanded={toggleDropdown}
                    aria-disabled={readonly}
                    ref={ref => {
                        this.toggleButton = ref;
                    }}
                >
                    <span className="adyen-checkout__dropdown__button__text">{active.selectedOptionName || active.name || placeholder}</span>
                    {active.icon && (
                        <img className="adyen-checkout__dropdown__button__icon" src={active.icon} alt={active.name} onError={this.handleOnError} />
                    )}
                </button>

                <ul
                    role="listbox"
                    className={cx({
                        'adyen-checkout__dropdown__list': true,
                        [styles['adyen-checkout__dropdown__list']]: true,
                        'adyen-checkout__dropdown__list--active': toggleDropdown,
                        [styles['adyen-checkout__dropdown__list--active']]: toggleDropdown
                    })}
                    ref={ref => {
                        this.dropdownList = ref;
                    }}
                >
                    {items.map(item => (
                        <li
                            key={item.id}
                            role="option"
                            tabIndex={-1}
                            aria-selected={item.id === active.id}
                            className={cx([
                                'adyen-checkout__dropdown__element',
                                styles['adyen-checkout__dropdown__element'],
                                { 'adyen-checkout__dropdown__element--active': item.id === active.id }
                            ])}
                            data-value={item.id}
                            onClick={this.select}
                            onKeyDown={this.handleKeyDown}
                        >
                            <span>{item.name}</span>

                            {item.icon && (
                                <img
                                    className="adyen-checkout__dropdown__element__icon"
                                    alt={item.name}
                                    src={item.icon}
                                    onError={this.handleOnError}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

export default Select;

import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact';
import { useState } from 'preact/hooks';
import Select from './Select';
import Field from '../Field';
import Language from '../../../../language';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { Resources } from '../../../../core/Context/Resources';
import { resolveEnvironments } from '../../../../core/Environment';
import type { CoreConfiguration } from '../../../../core/types';
import { SelectProps, SelectItem, SelectTargetObject } from './types';

const meta: Meta<SelectProps> = {
    title: 'Internal Elements/Select',
    component: Select as any,
    argTypes: {
        filterable: { control: 'boolean' },
        readonly: { control: 'boolean' },
        disabled: { control: 'boolean' },
        isInvalid: { control: 'boolean' },
        isValid: { control: 'boolean' },
        required: { control: 'boolean' },
        disableTextFilter: { control: 'boolean' },
        clearOnSelect: { control: 'boolean' },
        blurOnClose: { control: 'boolean' },
        allowIdOnButton: { control: 'boolean' },
        placeholder: { control: 'text' },
        name: { control: 'text' },
        uniqueId: { control: 'text' },
        className: { control: 'text' },
        classNameModifiers: { control: 'object' }
    }
};

const coreProps = {
    loadingContext: process.env.CLIENT_ENV,
    i18n: new Language({
        locale: 'en-US',
        translations: {
            'select.noOptionsFound': 'No options found'
        }
    }),
    resources: new Resources(resolveEnvironments(process.env.CLIENT_ENV as CoreConfiguration['environment']).cdnImagesUrl)
};

const sampleItems: SelectItem[] = [
    { id: 'option1', name: 'Option 1' },
    { id: 'option2', name: 'Option 2' },
    { id: 'option3', name: 'Option 3', disabled: true },
    { id: 'option4', name: 'Option 4' },
    { id: 'option5', name: 'Very long option name that might overflow the container' }
];

const itemsWithIcons: SelectItem[] = [
    { 
        id: 'visa', 
        name: 'Visa', 
        icon: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/visa.svg' 
    },
    { 
        id: 'mastercard', 
        name: 'Mastercard', 
        icon: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/mc.svg' 
    },
    { 
        id: 'amex', 
        name: 'American Express', 
        icon: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/amex.svg' 
    }
];

const itemsWithSecondaryText: SelectItem[] = [
    { id: 'account1', name: 'Checking Account', secondaryText: '****1234' },
    { id: 'account2', name: 'Savings Account', secondaryText: '****5678' },
    { id: 'account3', name: 'Business Account', secondaryText: '****9012', disabled: true }
];

const countryItems: SelectItem[] = [
    { id: 'US', name: 'United States' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'DE', name: 'Germany' },
    { id: 'FR', name: 'France' },
    { id: 'IT', name: 'Italy' },
    { id: 'ES', name: 'Spain' },
    { id: 'NL', name: 'Netherlands' },
    { id: 'BE', name: 'Belgium' },
    { id: 'AT', name: 'Austria' },
    { id: 'CH', name: 'Switzerland' }
];

export const Default: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue, setSelectedValue] = useState<string | number>('');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ width: '300px', padding: '20px' }}>
                    <Field
                        name="select-demo"
                        label="Select an option"
                        isValid={args.isValid}
                        errorMessage={args.isInvalid ? 'Please select a valid option' : ''}
                    >
                        <Select 
                            {...args} 
                            selectedValue={selectedValue}
                            onChange={(e) => {
                                setSelectedValue((e.target as SelectTargetObject).value);
                                console.log('Selected:', (e.target as SelectTargetObject).value);
                            }}
                        />
                    </Field>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['onChange', 'onInput', 'onListToggle'] }
    },
    args: {
        items: sampleItems,
        placeholder: 'Select an option',
        filterable: true,
        readonly: false,
        disabled: false,
        isInvalid: false,
        isValid: false,
        required: false,
        disableTextFilter: false,
        clearOnSelect: false,
        blurOnClose: false,
        allowIdOnButton: false,
        className: '',
        classNameModifiers: [],
        name: 'select-demo'
    }
};

export const WithIcons: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue, setSelectedValue] = useState<string | number>('');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ width: '300px', padding: '20px' }}>
                    <Field
                        name="payment-method"
                        label="Payment Method"
                    >
                        <Select 
                            {...args} 
                            selectedValue={selectedValue}
                            onChange={(e) => {
                                setSelectedValue((e.target as SelectTargetObject).value);
                                console.log('Selected:', (e.target as SelectTargetObject).value);
                            }}
                        />
                    </Field>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['filterable', 'readonly', 'disabled', 'placeholder'] }
    },
    args: {
        items: itemsWithIcons,
        placeholder: 'Select payment method',
        filterable: true,
        readonly: false,
        disabled: false,
        className: '',
        classNameModifiers: [],
        name: 'payment-method'
    }
};

export const WithSecondaryText: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue, setSelectedValue] = useState<string | number>('');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ width: '300px', padding: '20px' }}>
                    <Field
                        name="account-select"
                        label="Select Account"
                    >
                        <Select 
                            {...args} 
                            selectedValue={selectedValue}
                            onChange={(e) => {
                                setSelectedValue((e.target as SelectTargetObject).value);
                                console.log('Selected:', (e.target as SelectTargetObject).value);
                            }}
                        />
                    </Field>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['filterable', 'readonly', 'disabled', 'placeholder'] }
    },
    args: {
        items: itemsWithSecondaryText,
        placeholder: 'Select account',
        filterable: false,
        readonly: false,
        disabled: false,
        className: '',
        classNameModifiers: [],
        name: 'account-select'
    }
};

export const NonFilterable: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue, setSelectedValue] = useState<string | number>('option2');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ width: '300px', padding: '20px' }}>
                    <Field
                        name="non-filterable-select"
                        label="Non-filterable Select"
                        isValid={args.isValid}
                        errorMessage={args.isInvalid ? 'Please select a valid option' : ''}
                    >
                        <Select 
                            {...args} 
                            selectedValue={selectedValue}
                            onChange={(e) => {
                                setSelectedValue((e.target as SelectTargetObject).value);
                                console.log('Selected:', (e.target as SelectTargetObject).value);
                            }}
                        />
                    </Field>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['readonly', 'disabled', 'isInvalid', 'isValid'] }
    },
    args: {
        items: sampleItems,
        placeholder: 'Select an option',
        filterable: false,
        readonly: false,
        disabled: false,
        isInvalid: false,
        isValid: false,
        className: '',
        classNameModifiers: [],
        name: 'non-filterable-select'
    }
};

export const FilterableWithManyOptions: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue, setSelectedValue] = useState<string | number>('');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ width: '300px', padding: '20px' }}>
                    <Field
                        name="country-select"
                        label="Country"
                    >
                        <Select 
                            {...args} 
                            selectedValue={selectedValue}
                            onChange={(e) => {
                                setSelectedValue((e.target as SelectTargetObject).value);
                                console.log('Selected:', (e.target as SelectTargetObject).value);
                            }}
                            onInput={(value) => {
                                console.log('Filter input:', value);
                            }}
                        />
                    </Field>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['disableTextFilter', 'clearOnSelect', 'blurOnClose'] }
    },
    args: {
        items: countryItems,
        placeholder: 'Search countries...',
        filterable: true,
        readonly: false,
        disabled: false,
        disableTextFilter: false,
        clearOnSelect: false,
        blurOnClose: false,
        className: '',
        classNameModifiers: [],
        name: 'country-select'
    }
};

export const ValidationStates: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue, setSelectedValue] = useState<string | number>('');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ display: 'flex', gap: '20px', padding: '20px', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px' }}>
                        <Field
                            name="valid-select"
                            label="Valid State"
                            isValid={true}
                        >
                            <Select 
                                {...args}
                                isValid={true}
                                isInvalid={false}
                                selectedValue={selectedValue}
                                onChange={(e) => setSelectedValue((e.target as SelectTargetObject).value)}
                            />
                        </Field>
                    </div>
                    <div style={{ width: '200px' }}>
                        <Field
                            name="invalid-select"
                            label="Invalid State"
                            isValid={false}
                            errorMessage="Please select a valid option"
                        >
                            <Select 
                                {...args}
                                isValid={false}
                                isInvalid={true}
                                selectedValue={selectedValue}
                                onChange={(e) => setSelectedValue((e.target as SelectTargetObject).value)}
                            />
                        </Field>
                    </div>
                    <div style={{ width: '200px' }}>
                        <Field
                            name="disabled-select"
                            label="Disabled"
                        >
                            <Select 
                                {...args}
                                disabled={true}
                                selectedValue="option1"
                                onChange={(e) => setSelectedValue((e.target as SelectTargetObject).value)}
                            />
                        </Field>
                    </div>
                    <div style={{ width: '200px' }}>
                        <Field
                            name="readonly-select"
                            label="Readonly"
                            readOnly={true}
                        >
                            <Select 
                                {...args}
                                readonly={true}
                                selectedValue="option2"
                                onChange={(e) => setSelectedValue((e.target as SelectTargetObject).value)}
                            />
                        </Field>
                    </div>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['isValid', 'isInvalid', 'disabled', 'readonly', 'selectedValue'] }
    },
    args: {
        items: sampleItems,
        placeholder: 'Select an option',
        filterable: true,
        className: '',
        classNameModifiers: [],
        name: 'validation-demo'
    }
};

export const FocusStyleComparison: StoryObj<SelectProps> = {
    render: args => {
        const [selectedValue1, setSelectedValue1] = useState<string | number>('');
        const [selectedValue2, setSelectedValue2] = useState<string | number>('');
        const [selectedValue3, setSelectedValue3] = useState<string | number>('');
        const [selectedValue4, setSelectedValue4] = useState<string | number>('');
        
        return (
            <CoreProvider {...coreProps}>
                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>Box-shadow Focus Style</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ width: '300px' }}>
                                    <Field
                                        name="box-shadow-filterable"
                                        label="Filterable with Box-shadow"
                                    >
                                        <Select 
                                            {...args}
                                            items={sampleItems}
                                            filterable={true}
                                            selectedValue={selectedValue1}
                                            onChange={(e) => setSelectedValue1((e.target as SelectTargetObject).value)}
                                            className="adyen-checkout__dropdown--box-shadow-focus"
                                        />
                                    </Field>
                                </div>
                                <div style={{ width: '300px' }}>
                                    <Field
                                        name="box-shadow-non-filterable"
                                        label="Non-filterable with Box-shadow"
                                    >
                                        <Select 
                                            {...args}
                                            items={sampleItems}
                                            filterable={false}
                                            selectedValue={selectedValue2}
                                            onChange={(e) => setSelectedValue2((e.target as SelectTargetObject).value)}
                                            className="adyen-checkout__dropdown--box-shadow-focus"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>Outline Focus Style</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ width: '300px' }}>
                                    <Field
                                        name="outline-filterable"
                                        label="Filterable with Outline"
                                    >
                                        <Select 
                                            {...args}
                                            items={sampleItems}
                                            filterable={true}
                                            selectedValue={selectedValue3}
                                            onChange={(e) => setSelectedValue3((e.target as SelectTargetObject).value)}
                                            className="adyen-checkout__dropdown--outline-focus"
                                        />
                                    </Field>
                                </div>
                                <div style={{ width: '300px' }}>
                                    <Field
                                        name="outline-non-filterable"
                                        label="Non-filterable with Outline"
                                    >
                                        <Select 
                                            {...args}
                                            items={sampleItems}
                                            filterable={false}
                                            selectedValue={selectedValue4}
                                            onChange={(e) => setSelectedValue4((e.target as SelectTargetObject).value)}
                                            className="adyen-checkout__dropdown--outline-focus"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>Box-shadow Focus Style without setting active item on hover</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ width: '300px' }}>
                                    <Field
                                        name="outline-filterable"
                                        label="Filterable with Outline"
                                    >
                                        <Select 
                                            {...args}
                                            items={sampleItems}
                                            filterable={true}
                                            selectedValue={selectedValue3}
                                            activeOnHover={false}
                                            onChange={(e) => setSelectedValue3((e.target as SelectTargetObject).value)}
                                            className="adyen-checkout__dropdown--box-shadow-focus"
                                        />
                                    </Field>
                                </div>
                                <div style={{ width: '300px' }}>
                                    <Field
                                        name="outline-non-filterable"
                                        label="Non-filterable with Outline"
                                    >
                                        <Select 
                                            {...args}
                                            items={sampleItems}
                                            filterable={false}
                                            selectedValue={selectedValue4}
                                            activeOnHover={false}
                                            onChange={(e) => setSelectedValue4((e.target as SelectTargetObject).value)}
                                            className="adyen-checkout__dropdown--box-shadow-focus"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        padding: '16px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        <strong>Instructions:</strong> Use keyboard navigation (Tab to focus, Arrow keys to navigate options) to see the different focus styles in action.
                    </div>
                </div>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['onChange', 'onInput', 'onListToggle', 'selectedValue', 'className'] }
    },
    args: {
        placeholder: 'Select an option',
        readonly: false,
        disabled: false,
        isInvalid: false,
        isValid: false,
        required: false,
        disableTextFilter: false,
        clearOnSelect: false,
        blurOnClose: false,
        allowIdOnButton: false,
        classNameModifiers: [],
        name: 'focus-comparison'
    }
};

export default meta;

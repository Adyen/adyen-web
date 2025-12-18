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

export default meta;

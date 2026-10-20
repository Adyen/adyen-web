export type TokenKind = 'color' | 'font-weight' | 'radius' | 'shadow';

export interface PayButtonChange {
    v1Variable: string;
    variable: string;
    before: string;
    after: string;
    status: string;
}

export interface DefaultValueChange {
    variable: string;
    kind: TokenKind;
    before: string;
    after: string;
}

export interface NewVariable {
    variable: string;
    value: string;
    scope: string;
}

export const payButtonChanges: PayButtonChange[] = [
    {
        v1Variable: 'color-background-always-dark',
        variable: 'color-background-inverse-primary',
        before: '#00112c',
        after: '#111110',
        status: 'Deprecated, still applied as a fallback for --adyen-sdk-color-background-inverse-primary'
    },
    {
        v1Variable: 'color-background-inverse-primary-hover',
        variable: 'color-background-inverse-primary-hover',
        before: '#5c687c',
        after: '#30302f',
        status: 'Unchanged name'
    },
    {
        v1Variable: 'color-background-always-dark-active',
        variable: 'color-background-inverse-primary-active',
        before: '#8d95a3',
        after: '#3d3d3c',
        status: 'Deprecated, still applied as a fallback for --adyen-sdk-color-background-inverse-primary-active'
    }
];

export const defaultValueChanges: DefaultValueChange[] = [
    { variable: 'color-label-primary', kind: 'color', before: '#00112c', after: '#111111' },
    { variable: 'color-label-secondary', kind: 'color', before: '#5c687c', after: 'rgba(17, 17, 17, 0.64)' },
    { variable: 'color-label-tertiary', kind: 'color', before: '#5c687c', after: 'rgba(17, 17, 17, 0.45)' },
    { variable: 'color-label-disabled', kind: 'color', before: '#8d95a3', after: 'rgba(17, 17, 17, 0.38)' },
    { variable: 'color-label-critical', kind: 'color', before: '#c72727', after: '#ce3401' },
    { variable: 'color-label-highlight', kind: 'color', before: '#00112c', after: '#111111' },
    { variable: 'color-background-secondary', kind: 'color', before: '#f7f7f8', after: 'rgba(17, 17, 16, 0.04)' },
    { variable: 'color-background-secondary-hover', kind: 'color', before: '#eeeff1', after: 'rgba(17, 17, 16, 0.07)' },
    { variable: 'color-background-secondary-active', kind: 'color', before: '#e3e5e9', after: 'rgba(17, 17, 16, 0.11)' },
    { variable: 'color-background-tertiary', kind: 'color', before: '#eeeff1', after: 'rgba(17, 17, 16, 0.07)' },
    { variable: 'color-background-disabled', kind: 'color', before: '#eeeff1', after: 'rgba(17, 17, 16, 0.04)' },
    { variable: 'color-background-critical-strong', kind: 'color', before: '#e22d2d', after: '#dc3801' },
    { variable: 'color-outline-primary', kind: 'color', before: '#dbdee2', after: '#e5e5e5' },
    { variable: 'color-outline-primary-hover', kind: 'color', before: '#c9cdd3', after: '#d5d5d5' },
    { variable: 'color-outline-primary-active', kind: 'color', before: '#00112c', after: '#111111' },
    { variable: 'color-outline-secondary', kind: 'color', before: '#c9cdd3', after: '#d5d5d5' },
    { variable: 'color-outline-tertiary', kind: 'color', before: '#848d96', after: '#8c8c8c' },
    { variable: 'color-outline-disabled', kind: 'color', before: '#dbdee2', after: '#dddddd' },
    { variable: 'color-outline-critical', kind: 'color', before: '#e22d2d', after: '#ce3401' },
    { variable: 'color-separator-primary', kind: 'color', before: '#dbdee2', after: '#e5e5e5' },
    { variable: 'text-subtitle-font-weight', kind: 'font-weight', before: '500', after: '400' },
    { variable: 'text-subtitle-stronger-font-weight', kind: 'font-weight', before: '600', after: '500' },
    { variable: 'text-title-font-weight', kind: 'font-weight', before: '600', after: '700' },
    { variable: 'border-radius-m', kind: 'radius', before: '8px', after: '6px' },
    { variable: 'border-radius-l', kind: 'radius', before: '12px', after: '8px' },
    { variable: 'border-radius-xl', kind: 'radius', before: '24px', after: '12px' },
    {
        variable: 'shadow-low',
        kind: 'shadow',
        before: '0px 2px 4px rgba(0, 17, 44, 0.04), 0px 1px 2px rgba(0, 17, 44, 0.02)',
        after: '0px 2px 4px rgba(17, 17, 17, 0.04), 0px 1px 2px rgba(17, 17, 17, 0.02)'
    }
];

export const newVariables: NewVariable[] = [
    { variable: 'color-label-primary-active', value: 'rgba(17, 17, 17, 0.58)', scope: 'Icon-only button active text' },
    { variable: 'color-background-primary-active', value: '#efeeed', scope: 'Toggle active background' },
    {
        variable: 'color-background-tertiary-active',
        value: 'rgba(17, 17, 16, 0.15)',
        scope: 'Toggle background when checked and disabled or read-only'
    },
    { variable: 'color-background-critical-weak', value: '#ffeae3', scope: 'Error alert background' },
    { variable: 'color-background-warning-weak', value: '#ffecd0', scope: 'Warning alert background' }
];

export const toCssVariable = (name: string): string => `--adyen-sdk-${name}`;

/**
 * Custom properties that make SDK styles render with their Bento v1 defaults.
 * The SDK never declares `--adyen-sdk-*` itself, so setting them on a wrapper overrides the Bento v2 defaults.
 */
export const v1CssVariables: Record<string, string> = Object.fromEntries([
    ...defaultValueChanges.map(({ variable, before }) => [toCssVariable(variable), before]),
    ...payButtonChanges.map(({ variable, before }) => [toCssVariable(variable), before])
]);

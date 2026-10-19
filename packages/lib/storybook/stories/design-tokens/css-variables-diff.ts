export type TokenKind = 'color' | 'font-weight' | 'radius' | 'shadow';

export interface PayButtonChange {
    mainVariable: string;
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

export interface DocumentationCorrection {
    variable: string;
    staleValue: string;
    actualValue: string;
    reason: string;
}

export const MAIN_REF = 'origin/main (9ac8c54ba)';
export const BRANCH_REF = 'chore/upgrade-to-bento-design-tokens-v2 (18e64b10a)';

export const payButtonChanges: PayButtonChange[] = [
    {
        mainVariable: 'color-background-always-dark',
        variable: 'color-background-inverse-primary',
        before: '#00112c',
        after: '#111110',
        status: 'Deprecated fallback for --adyen-sdk-color-background-inverse-primary'
    },
    {
        mainVariable: 'color-background-inverse-primary-hover',
        variable: 'color-background-inverse-primary-hover',
        before: '#5c687c',
        after: '#30302f',
        status: 'Still used, no longer deprecated'
    },
    {
        mainVariable: 'color-background-always-dark-active',
        variable: 'color-background-inverse-primary-active',
        before: '#8d95a3',
        after: '#3d3d3c',
        status: 'Deprecated fallback for --adyen-sdk-color-background-inverse-primary-active'
    }
];

export const defaultValueChanges: DefaultValueChange[] = [
    { variable: 'color-label-primary', kind: 'color', before: '#00112c', after: '#111111' },
    { variable: 'color-label-secondary', kind: 'color', before: '#5c687c', after: 'rgba(17, 17, 17, 0.64)' },
    { variable: 'color-label-tertiary', kind: 'color', before: '#8d95a3', after: 'rgba(17, 17, 17, 0.64)' },
    { variable: 'color-label-disabled', kind: 'color', before: '#8d95a3', after: 'rgba(17, 17, 17, 0.38)' },
    { variable: 'color-label-critical', kind: 'color', before: '#e22d2d', after: '#b42e01' },
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

export const documentationCorrections: DocumentationCorrection[] = [
    { variable: 'color-label-highlight', staleValue: '#0070f5', actualValue: '#00112C', reason: 'Accessibility' },
    { variable: 'color-outline-tertiary', staleValue: '#8d95a3', actualValue: '#848D96', reason: 'Contrast' }
];

export const thingsToCheck: { title: string; description: string }[] = [
    {
        title: 'Pay button colour changed.',
        description: 'The default pay button changes from navy to near-black, so the visual regression screenshots need regenerating in CI.'
    },
    {
        title: 'Duplicate row.',
        description: '`color-background-critical-strong` appears twice in the table, on both `main` and the branch.'
    },
    {
        title: 'Inconsistent hex case.',
        description: '`#00112C` and `#848D96` are uppercase, matching the overrides in `variable-generator.scss`; every other hex value is lowercase.'
    },
    {
        title: 'Same value for secondary and tertiary labels.',
        description: '`label-secondary` and `label-tertiary` now share `rgba(17, 17, 17, 0.64)`.'
    }
];

export const toCssVariable = (name: string): string => `--adyen-sdk-${name}`;

/**
 * Custom properties that make SDK styles render with the values documented on `main`.
 * The SDK never declares `--adyen-sdk-*` itself, so setting them on a wrapper overrides the branch defaults.
 */
export const mainCssVariables: Record<string, string> = Object.fromEntries([
    ...defaultValueChanges.map(({ variable, before }) => [toCssVariable(variable), before]),
    ...payButtonChanges.map(({ variable, before }) => [toCssVariable(variable), before])
]);

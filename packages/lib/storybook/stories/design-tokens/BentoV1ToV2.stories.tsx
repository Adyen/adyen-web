import { h, ComponentChildren } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import Language from '../../../src/language';
import { CoreProvider } from '../../../src/core/Context/CoreProvider';
import { Resources } from '../../../src/core/Context/Resources';
import Button from '../../../src/components/internal/Button';
import Alert from '../../../src/components/internal/Alert';
import Field from '../../../src/components/internal/FormFields/Field';
import InputText from '../../../src/components/internal/FormFields/InputText';
import { componentVariableChanges, defaultValueChanges, newVariables, payButtonChanges, toCssVariable, v1CssVariables } from './bento-v1-to-v2';
import type { ILanguageService } from '../../../src/language/LanguageService';
import type { TokenKind } from './bento-v1-to-v2';
import './BentoV1ToV2.scss';

const languageServiceStub: ILanguageService = {
    fetchTranslationsFromCdn: () => Promise.resolve({})
};

const coreProps = {
    loadingContext: 'test',
    i18n: new Language({ locale: 'en-US', service: languageServiceStub }),
    resources: new Resources('https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/')
};

const Value = ({ value, kind = 'color' }: { readonly value: string; readonly kind?: TokenKind }) => (
    <div className="bento-v1-to-v2__value">
        <span aria-hidden="true" className={`bento-v1-to-v2__swatch bento-v1-to-v2__swatch--${kind}`} style={{ '--swatch-value': value }}>
            {kind === 'font-weight' ? 'Aa' : null}
        </span>
        <code>{value}</code>
    </div>
);

const SampleGroup = ({
    title,
    tokenPrefix,
    children
}: {
    readonly title: string;
    readonly tokenPrefix: string;
    readonly children: ComponentChildren;
}) => (
    <div className="bento-v1-to-v2__group">
        <div className="bento-v1-to-v2__group-heading">
            {title} <code>{tokenPrefix}</code>
        </div>
        {children}
    </div>
);

const ComponentsPreview = ({ heading }: { readonly heading: string }) => (
    <section className="bento-v1-to-v2__panel" aria-label={heading}>
        <div className="bento-v1-to-v2__panel-heading">{heading}</div>

        <SampleGroup title="Text weight" tokenPrefix="text-*-font-weight">
            <div className="bento-v1-to-v2__sample-title">Title (text-title-font-weight)</div>
            <div className="bento-v1-to-v2__sample-subtitle">Subtitle (text-subtitle-stronger-font-weight)</div>
        </SampleGroup>

        <SampleGroup title="Text colour" tokenPrefix="color-label-*">
            <div className="bento-v1-to-v2__sample-labels">
                <span>primary</span>
                <span className="bento-v1-to-v2__label--secondary">secondary</span>
                <span className="bento-v1-to-v2__label--tertiary">tertiary</span>
                <span className="bento-v1-to-v2__label--disabled">disabled</span>
                <span className="bento-v1-to-v2__label--critical">critical</span>
                <span className="bento-v1-to-v2__label--highlight">highlight</span>
            </div>
        </SampleGroup>

        <SampleGroup title="Background colour" tokenPrefix="color-background-*">
            <div className="bento-v1-to-v2__surfaces">
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--secondary">secondary</div>
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--tertiary">tertiary</div>
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--disabled">disabled</div>
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--critical-strong">critical-strong</div>
            </div>
        </SampleGroup>

        <SampleGroup title="Outline colour" tokenPrefix="color-outline-*">
            <div className="bento-v1-to-v2__surfaces">
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--outline-primary">primary</div>
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--outline-secondary">secondary</div>
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--outline-critical">critical</div>
            </div>
        </SampleGroup>

        <SampleGroup title="Border radius" tokenPrefix="border-radius-*">
            <div className="bento-v1-to-v2__surfaces">
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--radius-l">l</div>
                <div className="bento-v1-to-v2__surface bento-v1-to-v2__surface--radius-xl">xl</div>
            </div>
        </SampleGroup>

        <div className="bento-v1-to-v2__group-heading">Components</div>
        <CoreProvider {...coreProps}>
            <div className="bento-v1-to-v2__buttons">
                <Button variant="primary" label="Pay €10.00" onClick={() => console.log('Pay button clicked')} />
                <Button variant="primary" label="Pay €10.00 (disabled)" disabled />
                <Button variant="secondary" label="Secondary" onClick={() => console.log('Secondary button clicked')} />
            </div>
            <Field label="Cardholder name" name={`holder-${heading}`}>
                <InputText name={`holder-${heading}`} value="J. Smith" autocomplete="cc-name" />
            </Field>
            <Field label="Cardholder name" name={`holder-error-${heading}`} errorMessage="Enter the cardholder name">
                <InputText name={`holder-error-${heading}`} value="" isInvalid autocomplete="cc-name" />
            </Field>
            <Alert type="error" icon="cross">
                Something went wrong
            </Alert>
        </CoreProvider>
    </section>
);

const BentoV1ToV2Page = () => (
    <div className="bento-v1-to-v2">
        <h1>Bento v1 to v2</h1>
        <p>
            The Web SDK styles are generated from the <code>@adyen/bento-design-tokens</code> package. This page describes how the{' '}
            <code>--adyen-sdk-*</code> CSS variables changed when the SDK moved from Bento v1 to Bento v2.
        </p>
        <p>
            Variable names in the tables below omit the <code>--adyen-sdk-</code> prefix unless written in full.
        </p>

        <h2>Side by side</h2>
        <p>
            Both panels render the current components. The left panel sets every changed variable to its Bento v1 default; the right panel uses the
            Bento v2 defaults. Hover and press the pay button to compare the hover and active states.
        </p>
        <div className="bento-v1-to-v2__comparison">
            <div style={v1CssVariables}>
                <ComponentsPreview heading="Bento v1" />
            </div>
            <ComponentsPreview heading="Bento v2" />
        </div>

        <h2>Pay button variables</h2>
        <p>
            The pay button uses the Bento v2 <code>inverse-primary</code> tokens. The Bento v1 variables still apply to the pay button as fallbacks,
            and only there. If both are set, the Bento v2 variable wins.
        </p>
        <table className="bento-v1-to-v2__table">
            <thead>
                <tr>
                    <th scope="col">Bento v1 variable</th>
                    <th scope="col">Bento v1 default</th>
                    <th scope="col">Status</th>
                    <th scope="col">Bento v2 default</th>
                </tr>
            </thead>
            <tbody>
                {payButtonChanges.map(change => (
                    <tr key={change.v1Variable}>
                        <td>
                            <code>{toCssVariable(change.v1Variable)}</code>
                        </td>
                        <td>
                            <Value value={change.before} />
                        </td>
                        <td>{change.status}</td>
                        <td>
                            <Value value={change.after} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        <h2>Default value changed</h2>
        <table className="bento-v1-to-v2__table">
            <thead>
                <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">Bento v1</th>
                    <th scope="col">Bento v2</th>
                </tr>
            </thead>
            <tbody>
                {defaultValueChanges.map(change => (
                    <tr key={change.variable}>
                        <td>
                            <code>{change.variable}</code>
                        </td>
                        <td>
                            <Value value={change.before} kind={change.kind} />
                        </td>
                        <td>
                            <Value value={change.after} kind={change.kind} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        <h2>New variables</h2>
        <p>
            Core tokens the SDK uses for the first time with Bento v2, mostly in place of a component variable. The pay button&apos;s{' '}
            <code>color-background-inverse-primary</code> and <code>color-background-inverse-primary-active</code>, covered above, are also new.
        </p>
        <table className="bento-v1-to-v2__table">
            <thead>
                <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">Default</th>
                    <th scope="col">Used for</th>
                </tr>
            </thead>
            <tbody>
                {newVariables.map(item => (
                    <tr key={item.variable}>
                        <td>
                            <code>{item.variable}</code>
                        </td>
                        <td>
                            <Value value={item.value} />
                        </td>
                        <td>{item.scope}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <h2>Component variables</h2>
        <p>
            Bento v1 shipped component tokens for the alert, toggle and icon-only button. Bento v2 replaces them with core tokens. Where a core token
            replaces a single component variable, that variable still applies as a fallback within its component. If both are set, the core token
            wins. Other component variables are no longer applied.
        </p>
        <table className="bento-v1-to-v2__table">
            <thead>
                <tr>
                    <th scope="col">Bento v1 variable</th>
                    <th scope="col">Bento v2 value</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                {componentVariableChanges.map(change => (
                    <tr key={change.variable}>
                        <td>
                            <code>{change.variable}</code>
                        </td>
                        <td>
                            <code>{change.replacement}</code>
                        </td>
                        <td>{change.appliedAsFallback ? 'Applied as a fallback' : 'No longer applied'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const meta: Meta = {
    title: 'Design Tokens/Bento v1 to v2',
    tags: ['no-automated-visual-test'],
    parameters: {
        layout: 'fullscreen',
        controls: { disable: true }
    }
};

export const BentoV1ToV2: StoryObj = {
    name: 'Bento v1 to v2',
    render: () => <BentoV1ToV2Page />
};

export default meta;

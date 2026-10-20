import { h, ComponentChildren } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import Language from '../../../src/language';
import { CoreProvider } from '../../../src/core/Context/CoreProvider';
import { Resources } from '../../../src/core/Context/Resources';
import Button from '../../../src/components/internal/Button';
import Alert from '../../../src/components/internal/Alert';
import Field from '../../../src/components/internal/FormFields/Field';
import InputText from '../../../src/components/internal/FormFields/InputText';
import {
    BRANCH_REF,
    MAIN_REF,
    defaultValueChanges,
    documentationCorrections,
    mainCssVariables,
    payButtonChanges,
    thingsToCheck,
    toCssVariable
} from './css-variables-diff';
import type { ILanguageService } from '../../../src/language/LanguageService';
import type { TokenKind } from './css-variables-diff';
import './CssVariablesDiff.scss';

const languageServiceStub: ILanguageService = {
    fetchTranslationsFromCdn: () => Promise.resolve({})
};

const coreProps = {
    loadingContext: 'test',
    i18n: new Language({ locale: 'en-US', service: languageServiceStub }),
    resources: new Resources('https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/')
};

const InlineMarkdown = ({ text }: { readonly text: string }) => (
    <span>{text.split('`').map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part))}</span>
);

const Value = ({ value, kind = 'color' }: { readonly value: string; readonly kind?: TokenKind }) => (
    <div className="css-variables-diff__value">
        <span aria-hidden="true" className={`css-variables-diff__swatch css-variables-diff__swatch--${kind}`} style={{ '--swatch-value': value }}>
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
    <div className="css-variables-diff__group">
        <div className="css-variables-diff__group-heading">
            {title} <code>{tokenPrefix}</code>
        </div>
        {children}
    </div>
);

const ComponentsPreview = ({ heading }: { readonly heading: string }) => (
    <section className="css-variables-diff__panel" aria-label={heading}>
        <div className="css-variables-diff__panel-heading">{heading}</div>

        <SampleGroup title="Text weight" tokenPrefix="text-*-font-weight">
            <div className="css-variables-diff__sample-title">Title (text-title-font-weight)</div>
            <div className="css-variables-diff__sample-subtitle">Subtitle (text-subtitle-stronger-font-weight)</div>
        </SampleGroup>

        <SampleGroup title="Text colour" tokenPrefix="color-label-*">
            <div className="css-variables-diff__sample-labels">
                <span>primary</span>
                <span className="css-variables-diff__label--secondary">secondary</span>
                <span className="css-variables-diff__label--tertiary">tertiary</span>
                <span className="css-variables-diff__label--disabled">disabled</span>
                <span className="css-variables-diff__label--critical">critical</span>
                <span className="css-variables-diff__label--highlight">highlight</span>
            </div>
        </SampleGroup>

        <SampleGroup title="Background colour" tokenPrefix="color-background-*">
            <div className="css-variables-diff__surfaces">
                <div className="css-variables-diff__surface css-variables-diff__surface--secondary">secondary</div>
                <div className="css-variables-diff__surface css-variables-diff__surface--tertiary">tertiary</div>
                <div className="css-variables-diff__surface css-variables-diff__surface--disabled">disabled</div>
                <div className="css-variables-diff__surface css-variables-diff__surface--critical-strong">critical-strong</div>
            </div>
        </SampleGroup>

        <SampleGroup title="Outline colour" tokenPrefix="color-outline-*">
            <div className="css-variables-diff__surfaces">
                <div className="css-variables-diff__surface css-variables-diff__surface--outline-primary">primary</div>
                <div className="css-variables-diff__surface css-variables-diff__surface--outline-secondary">secondary</div>
                <div className="css-variables-diff__surface css-variables-diff__surface--outline-critical">critical</div>
            </div>
        </SampleGroup>

        <SampleGroup title="Border radius" tokenPrefix="border-radius-*">
            <div className="css-variables-diff__surfaces">
                <div className="css-variables-diff__surface css-variables-diff__surface--radius-l">l</div>
                <div className="css-variables-diff__surface css-variables-diff__surface--radius-xl">xl</div>
            </div>
        </SampleGroup>

        <div className="css-variables-diff__group-heading">Components</div>
        <CoreProvider {...coreProps}>
            <div className="css-variables-diff__buttons">
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

const CssVariablesDiffPage = () => (
    <div className="css-variables-diff">
        <h1>README CSS variables diff</h1>
        <p>
            Comparison of the documented CSS variables table in <code>README.md</code> between <code>{MAIN_REF}</code> and <code>{BRANCH_REF}</code>.
        </p>
        <p>
            Variable names in the tables below omit the <code>--adyen-sdk-</code> prefix unless written in full.
        </p>

        <h2>Side by side</h2>
        <p>
            Both panels render the current source. The left panel sets every changed <code>--adyen-sdk-*</code> variable to its <code>main</code>{' '}
            default; the right panel uses the branch defaults. Hover and press the pay button to compare the hover and active states.
        </p>
        <div className="css-variables-diff__comparison">
            <div style={mainCssVariables}>
                <ComponentsPreview heading="main" />
            </div>
            <ComponentsPreview heading="Branch (Bento v2)" />
        </div>

        <h2>Pay button variables</h2>
        <p>
            The pay button now uses the Bento v2 <code>inverse-primary</code> tokens. The <code>main</code> variables still apply to the pay button as
            fallbacks through <code>component-token()</code> in <code>variable-generator.scss</code>, and only there. If both are set, the new
            variable wins.
        </p>
        <table className="css-variables-diff__table">
            <thead>
                <tr>
                    <th scope="col">
                        <code>main</code> variable
                    </th>
                    <th scope="col">
                        <code>main</code> default
                    </th>
                    <th scope="col">Now</th>
                    <th scope="col">New default</th>
                </tr>
            </thead>
            <tbody>
                {payButtonChanges.map(change => (
                    <tr key={change.mainVariable}>
                        <td>
                            <code>{toCssVariable(change.mainVariable)}</code>
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
        <p>
            <code>--adyen-sdk-color-background-inverse-primary</code> and <code>--adyen-sdk-color-background-inverse-primary-active</code> are newly
            documented.
        </p>

        <h2>Default value changed</h2>
        <table className="css-variables-diff__table">
            <thead>
                <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">
                        Old (<code>main</code>)
                    </th>
                    <th scope="col">New (branch)</th>
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

        <h2>Documentation corrected, value unchanged</h2>
        <p>
            These overrides in <code>variable-generator.scss</code> already existed on <code>main</code>, but <code>main</code>&apos;s README listed
            the Bento defaults instead. They override Bento v2 (<code>#006bd7</code> and <code>#949494</code>) the same way.
        </p>
        <table className="css-variables-diff__table">
            <thead>
                <tr>
                    <th scope="col">Variable</th>
                    <th scope="col">
                        <code>main</code> README (stale)
                    </th>
                    <th scope="col">
                        Actual value on <code>main</code> and branch
                    </th>
                    <th scope="col">Reason for override</th>
                </tr>
            </thead>
            <tbody>
                {documentationCorrections.map(correction => (
                    <tr key={correction.variable}>
                        <td>
                            <code>{correction.variable}</code>
                        </td>
                        <td>
                            <Value value={correction.staleValue} />
                        </td>
                        <td>
                            <Value value={correction.actualValue} />
                        </td>
                        <td>{correction.reason}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <h2>Things to check</h2>
        <ul>
            {thingsToCheck.map(item => (
                <li key={item.title}>
                    <strong>{item.title}</strong> <InlineMarkdown text={item.description} />
                </li>
            ))}
        </ul>
    </div>
);

const meta: Meta = {
    title: 'Design Tokens/CSS Variables Diff',
    tags: ['no-automated-visual-test'],
    parameters: {
        layout: 'fullscreen',
        controls: { disable: true }
    }
};

export const BentoV2: StoryObj = {
    name: 'Bento v2',
    render: () => <CssVariablesDiffPage />
};

export default meta;

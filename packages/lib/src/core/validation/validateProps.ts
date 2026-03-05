import { z } from 'zod/mini';
import { CoreConfigurationSchema } from './CoreConfigurationSchema';
import { UIElementPropsSchema } from './UIElementPropsSchema';

let errorMapConfigured = false;

function configureErrorMap(): void {
    if (errorMapConfigured) return;
    errorMapConfigured = true;

    z.config({
        customError: (issue: any) => {
            if (issue.code === 'invalid_type') {
                return `expected ${issue.expected}, received ${issue.input === null ? 'null' : typeof issue.input}`;
            }
            if (issue.code === 'unrecognized_keys') {
                return `unknown property "${issue.keys.join('", "')}"`;
            }
            if (issue.code === 'invalid_value') {
                return `must be one of: ${issue.values.join(', ')}`;
            }
            return 'invalid value';
        }
    });
}

/**
 * Validates props against a Zod Mini schema and logs warnings for any issues.
 * This is advisory-only — it never throws.
 *
 * @param schema - Zod Mini schema to validate against
 * @param props - The props object to validate
 * @param componentName - Name used in warning messages
 * @internal
 */
function validateProps(schema: z.ZodMiniType, props: Record<string, unknown>, componentName: string): void {
    if (process.env.NODE_ENV !== 'development') return;

    configureErrorMap();

    const result = z.safeParse(schema, props);

    if (!result.success) {
        for (const issue of result.error.issues) {
            const path = issue.path.join('.') || 'unknown';
            console.warn(`${componentName} - Invalid configuration: "${path}" ${issue.message}`);
        }
    }
}

/**
 * Validates CoreConfiguration props and logs warnings for any issues.
 * Gated behind NODE_ENV === 'development' so it is tree-shaken from production builds.
 *
 * @param props - The CoreConfiguration props to validate
 */
export function validateCoreConfiguration(props: Record<string, unknown>): void {
    validateProps(CoreConfigurationSchema, props, 'AdyenCheckout');
}

/**
 * Validates UIElement props and logs warnings for any issues.
 * Gated behind NODE_ENV === 'development' so it is tree-shaken from production builds.
 *
 * @param props - The UIElement props to validate
 */
export function validateUIElementProps(props: Record<string, unknown>): void {
    validateProps(UIElementPropsSchema, props, 'UIElement');
}

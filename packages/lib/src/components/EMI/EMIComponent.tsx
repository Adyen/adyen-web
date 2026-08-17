import { h, Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Alert from '../internal/Alert';
import { PREFIX } from '../internal/Icon/constants';
import { useCoreContext } from '../../core/Context/CoreProvider';
import { useA11yReporter } from '../../core/Errors/useA11yReporter';
import { EMIPlanSelection } from './components/EMIPlanSelection';
import { EMIPlanSummary } from './components/EMIPlanSummary';
import { selectDisplayOffer } from './utils';
import { getUniqueId } from '../../utils/idGenerator';
import type UIElement from '../internal/UIElement/UIElement';
import type { ComponentMethodsRef, UIElementStatus } from '../internal/UIElement/types';
import type { PayButtonProps } from '../internal/PayButton/PayButton';
import type { EmiIssuer, EmiSelection } from './types';
import styles from './EMI.module.scss';

interface EMIComponentProps {
    activeFundingSourceElement: UIElement | null;
    issuers: EmiIssuer[];
    onPlanSelect(selection: EmiSelection): void;
    showPayButton?: boolean;
    payButton(props: PayButtonProps): h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

/**
 * The first issuer and its first plan, or nothing when the response holds no issuer. Every issuer
 * carries at least one plan, which the lookup contract guarantees.
 */
const getDefaultSelection = (issuers: EmiIssuer[]): EmiSelection | null => {
    const [issuer] = issuers;

    return issuer ? { issuer, plan: issuer.plans[0] } : null;
};

export function EMIComponent({
    activeFundingSourceElement,
    issuers,
    onPlanSelect,
    showPayButton,
    payButton,
    setComponentRef
}: Readonly<EMIComponentProps>): h.JSX.Element | null {
    const { i18n } = useCoreContext();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    // Preselected during the first render, so the very first paint already shows a complete plan
    const [selection, setSelection] = useState<EmiSelection | null>(() => getDefaultSelection(issuers));

    const titleId = useMemo(() => getUniqueId('adyen-checkout-emi-title'), []);
    const instructionsId = useMemo(() => getUniqueId('adyen-checkout-emi-instructions'), []);
    const planSummaryId = useMemo(() => getUniqueId('adyen-checkout-emi-plan-summary'), []);

    const emiRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {}
    });

    useEffect(() => {
        setComponentRef(emiRef.current);
    }, [setComponentRef]);

    // The container needs every selection for the payment request, including the preselected one
    useEffect(() => {
        if (selection) onPlanSelect(selection);
    }, [selection]);

    const offer = selection ? selectDisplayOffer(selection.plan.offers) : undefined;
    const discountMessage =
        selection && offer
            ? i18n.get('emi.discountApplied', {
                  // The locale places the minus sign, the same way it places the currency symbol
                  values: { amount: i18n.amount(-offer.amount.value, offer.amount.currency), provider: selection.issuer.issuerName }
              })
            : null;

    /**
     * The banner below is mounted together with its own text, which no screen reader announces
     * reliably, so the message goes through the SR panel that is always present instead.
     */
    useA11yReporter(discountMessage);

    if (!activeFundingSourceElement) {
        return null;
    }

    return (
        <div className={styles.emiWrapper}>
            {selection && (
                <Fragment>
                    <h2 id={titleId} className={styles.emiTitle}>
                        {i18n.get('emi.title')}
                    </h2>
                    <p id={instructionsId} className={styles.emiInstructions}>
                        {i18n.get('emi.instructions')}
                    </p>

                    <EMIPlanSelection
                        issuers={issuers}
                        selection={selection}
                        onSelectionChange={setSelection}
                        labelledBy={titleId}
                        describedBy={instructionsId}
                    />

                    {discountMessage && (
                        <Alert type={'success'} icon={`${PREFIX}checkmark_black`}>
                            {discountMessage}
                        </Alert>
                    )}

                    <h3 id={planSummaryId} className={styles.emiSectionHeading}>
                        {i18n.get('emi.planSummary')}
                    </h3>
                    <EMIPlanSummary plan={selection.plan} labelledBy={planSummaryId} />

                    <h3 className={styles.emiSectionHeading}>{i18n.get('emi.cardDetails')}</h3>
                    <p className={styles.emiInstructions}>
                        {i18n.get('emi.cardDetailsInstructions', { values: { provider: selection.issuer.issuerName } })}
                    </p>
                </Fragment>
            )}

            <div className={styles.emiFundingSourceForm}>{activeFundingSourceElement.render()}</div>
            {showPayButton && payButton({ status })}
        </div>
    );
}

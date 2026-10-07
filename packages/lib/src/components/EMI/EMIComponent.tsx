import { h, Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Alert from '../internal/Alert';
import Spinner from '../internal/Spinner';
import { PREFIX } from '../internal/Icon/constants';
import { useCoreContext } from '../../core/Context/CoreProvider';
import { useA11yReporter } from '../../core/Errors/useA11yReporter';
import { useLoadingA11yReporter } from '../../core/Errors/useLoadingA11yReporter';
import { EMIPlanSelection } from './components/EMIPlanSelection';
import { EMIPlanSummary } from './components/EMIPlanSummary';
import { EMITerms } from './components/EMITerms';
import { getUniqueId } from '../../utils/idGenerator';
import type UIElement from '../internal/UIElement/UIElement';
import type { ComponentMethodsRef, UIElementStatus } from '../internal/UIElement/types';
import type { PayButtonProps } from '../internal/PayButton/PayButton';
import type { EmiIssuer, EmiPlansOutcome, EmiSelection, EmiSelectTarget } from './types';
import styles from './EMI.module.scss';

interface EMIComponentProps {
    activeSupportedPaymentMethodElement: UIElement;
    /** Memoized by the element, so calling it again returns the same lookup. */
    loadPlans(): Promise<EmiPlansOutcome>;
    /** The outcome of an earlier render, so a re-render starts from it rather than from the spinner. */
    initialOutcome?: EmiPlansOutcome;
    onPlanSelect(selection: EmiSelection, target?: EmiSelectTarget): void;
    showPayButton?: boolean;
    payButton(props: PayButtonProps): h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

interface EMIPlansFormProps extends Omit<EMIComponentProps, 'loadPlans' | 'initialOutcome' | 'setComponentRef'> {
    issuers: EmiIssuer[];
    status: UIElementStatus;
}

const getDefaultSelection = (issuers: EmiIssuer[]): EmiSelection | null => {
    const [issuer] = issuers;

    return issuer ? { issuer, plan: issuer.plans[0] } : null;
};

/**
 * Loads the plans when it mounts, which is when the shopper opens the tile in Drop-in and when the standalone
 * component is mounted. Anything but plans to select keeps the spinner: there is no error screen yet, the same as
 * PayPal and AmazonPay, and the card form and pay button stay hidden so nothing can be paid without a plan.
 */
export function EMIComponent({ loadPlans, initialOutcome, setComponentRef, ...formProps }: Readonly<EMIComponentProps>): h.JSX.Element {
    const [outcome, setOutcome] = useState<EmiPlansOutcome | undefined>(initialOutcome);
    const [status, setStatus] = useState<UIElementStatus>('ready');

    const emiRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {}
    });

    useEffect(() => {
        setComponentRef(emiRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        if (outcome) return undefined;

        let isMounted = true;
        void loadPlans().then(result => {
            if (isMounted) setOutcome(result);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const issuers = outcome?.status === 'ready' ? outcome.issuers : null;

    // The spinner has no accessible name, and this component stays mounted across the transition
    useLoadingA11yReporter(!issuers);

    if (!issuers) {
        return (
            <div className={styles.emiWrapper}>
                <Spinner />
            </div>
        );
    }

    return <EMIPlansForm {...formProps} issuers={issuers} status={status} />;
}

function EMIPlansForm({
    activeSupportedPaymentMethodElement,
    issuers,
    onPlanSelect,
    showPayButton,
    payButton,
    status
}: Readonly<EMIPlansFormProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    // Preselected during the first render, so the very first paint already shows a complete plan
    const [selection, setSelection] = useState<EmiSelection | null>(() => getDefaultSelection(issuers));

    const titleId = useMemo(() => getUniqueId('adyen-checkout-emi-title'), []);
    const instructionsId = useMemo(() => getUniqueId('adyen-checkout-emi-instructions'), []);
    const planSummaryId = useMemo(() => getUniqueId('adyen-checkout-emi-plan-summary'), []);

    const selectTarget = useRef<EmiSelectTarget | undefined>(undefined);

    // The container needs every selection for the payment request, including the preselected one
    useEffect(() => {
        if (selection) onPlanSelect(selection, selectTarget.current);
    }, [selection]);

    // Names the select the shopper changed, and stays empty for the selection made on their behalf
    const handleSelectionChange = (nextSelection: EmiSelection, target: EmiSelectTarget): void => {
        selectTarget.current = target;
        setSelection(nextSelection);
    };

    const instantDiscount = selection?.plan.transactionAmounts.totalInstantDiscountAmount;
    const discountMessage =
        selection && instantDiscount
            ? i18n.get('emi.discountApplied', {
                  values: { amount: i18n.amount(-instantDiscount.value, instantDiscount.currency), provider: selection.issuer.issuerName }
              })
            : null;

    /**
     * The banner below is mounted together with its own text, which no screen reader announces
     * reliably, so the message goes through the SR panel that is always present instead.
     */
    useA11yReporter(discountMessage);

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
                        onSelectionChange={handleSelectionChange}
                        labelledBy={titleId}
                        describedBy={instructionsId}
                    />

                    {discountMessage && (
                        <Alert type={'success'} icon={`${PREFIX}checkmark`} iconPosition={'end'} classNames={[styles.emiDiscountBanner]}>
                            {discountMessage}
                        </Alert>
                    )}

                    <h3 id={planSummaryId} className={styles.emiSectionHeading}>
                        {i18n.get('emi.planSummary')}
                    </h3>
                    <EMIPlanSummary plan={selection.plan} labelledBy={planSummaryId} />
                    <EMITerms termLink={selection.issuer.termLink} processingMessage={selection.plan.processingAmounts?.message} />

                    <h3 className={styles.emiTitle}>
                        {selection.issuer.issuerName} {i18n.get('emi.cardDetails')}
                    </h3>
                    <p className={styles.emiInstructions}>
                        {i18n.get('emi.cardDetailsInstructions', { values: { provider: selection.issuer.issuerName } })}
                    </p>
                </Fragment>
            )}

            <div className={styles.emiSupportedPaymentMethodForm}>{activeSupportedPaymentMethodElement.render()}</div>
            {/* The plan summary already itemises every figure, so the button label omits the amount */}
            {showPayButton && payButton({ status, label: i18n.get('payButton') })}
        </div>
    );
}

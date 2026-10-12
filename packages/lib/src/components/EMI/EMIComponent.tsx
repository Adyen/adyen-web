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
import type { EmiIssuer, EmiPlansState, EmiSelection, EmiSelectTarget } from './types';
import styles from './EMI.module.scss';

interface EMIComponentProps {
    activeSupportedPaymentMethodElement: UIElement;
    loadPlans(): Promise<EmiPlansState>;
    initialPlans?: EmiPlansState;
    onPlanSelect(selection: EmiSelection, target?: EmiSelectTarget): void;
    showPayButton?: boolean;
    payButton(props: PayButtonProps): h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

interface EMIPlansFormProps extends Omit<EMIComponentProps, 'loadPlans' | 'initialPlans' | 'setComponentRef'> {
    issuers: EmiIssuer[];
    status: UIElementStatus;
}

const getDefaultSelection = (issuers: EmiIssuer[]): EmiSelection | null => {
    const [issuer] = issuers;

    return issuer ? { issuer, plan: issuer.plans[0] } : null;
};

export function EMIComponent({ loadPlans, initialPlans, setComponentRef, ...formProps }: Readonly<EMIComponentProps>): h.JSX.Element {
    const [plans, setPlans] = useState<EmiPlansState | undefined>(initialPlans);
    const [status, setStatus] = useState<UIElementStatus>('ready');

    const emiRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {}
    });

    useEffect(() => {
        setComponentRef(emiRef.current);
    }, [setComponentRef]);

    useEffect(() => {
        if (plans) return undefined;

        let isMounted = true;
        void loadPlans().then(loadedPlans => {
            if (isMounted) setPlans(loadedPlans);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const issuers = plans?.status === 'ready' ? plans.issuers : null;

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
    const [selection, setSelection] = useState<EmiSelection | null>(() => getDefaultSelection(issuers));

    const titleId = useMemo(() => getUniqueId('adyen-checkout-emi-title'), []);
    const instructionsId = useMemo(() => getUniqueId('adyen-checkout-emi-instructions'), []);
    const planSummaryId = useMemo(() => getUniqueId('adyen-checkout-emi-plan-summary'), []);

    const selectTarget = useRef<EmiSelectTarget | undefined>(undefined);

    useEffect(() => {
        if (selection) onPlanSelect(selection, selectTarget.current);
    }, [selection]);

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
            {showPayButton && payButton({ status, label: i18n.get('payButton') })}
        </div>
    );
}

import { h, Fragment } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../core/Context/CoreProvider';
import { EMIPlanSelection } from './components/EMIPlanSelection';
import { EMIPlanSummary } from './components/EMIPlanSummary';
import type UIElement from '../internal/UIElement/UIElement';
import type { ComponentMethodsRef, UIElementStatus } from '../internal/UIElement/types';
import type { PayButtonProps } from '../internal/PayButton/PayButton';
import type { EmiIssuerOption, EmiSelection } from './types';
import styles from './EMI.module.scss';

interface EMIComponentProps {
    activeFundingSourceElement: UIElement | null;
    issuers: EmiIssuerOption[];
    onPlanSelect(selection: EmiSelection): void;
    showPayButton?: boolean;
    payButton(props: PayButtonProps): h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

/**
 * First issuer, first plan. Resolved during render so the very first paint already shows a complete
 * plan, instead of appearing empty until an effect has run.
 */
function getDefaultSelection(issuers: EmiIssuerOption[]): EmiSelection | null {
    const issuer = issuers[0];
    const plan = issuer?.plans[0];

    return issuer && plan ? { issuer, plan } : null;
}

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
    const [selection, setSelection] = useState<EmiSelection | null>(() => getDefaultSelection(issuers));

    const emiRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {}
    });

    useEffect(() => {
        setComponentRef(emiRef.current);
    }, [setComponentRef]);

    const selectPlan = useCallback(
        (newSelection: EmiSelection) => {
            setSelection(newSelection);
            onPlanSelect(newSelection);
        },
        [onPlanSelect]
    );

    // Announces the default selection, and re-resolves it whenever a new set of plans arrives
    useEffect(() => {
        const defaultSelection = getDefaultSelection(issuers);

        setSelection(defaultSelection);
        if (defaultSelection) onPlanSelect(defaultSelection);
    }, [issuers]);

    if (!activeFundingSourceElement) {
        return null;
    }

    return (
        <div className={styles.emiWrapper}>
            {selection && (
                <Fragment>
                    <h2 className={styles.emiTitle}>{i18n.get('emi.title')}</h2>
                    <p className={styles.emiInstructions}>{i18n.get('emi.instructions')}</p>

                    <EMIPlanSelection issuers={issuers} selection={selection} onSelectionChange={selectPlan} />

                    <h3 className={styles.emiSectionHeading}>{i18n.get('emi.planSummary')}</h3>
                    <EMIPlanSummary plan={selection.plan} />

                    <h3 className={styles.emiSectionHeading}>{i18n.get('emi.cardDetails')}</h3>
                    <p className={styles.emiInstructions}>
                        {i18n.get('emi.cardDetailsInstructions', { values: { provider: selection.issuer.name } })}
                    </p>
                </Fragment>
            )}

            <div className={styles.emiFundingSourceForm}>{activeFundingSourceElement.render()}</div>
            {showPayButton && payButton({ status })}
        </div>
    );
}

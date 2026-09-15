import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type UIElement from '../internal/UIElement/UIElement';
import type { ComponentMethodsRef, UIElementStatus } from '../internal/UIElement/types';
import type { PayButtonProps } from '../internal/PayButton/PayButton';
import styles from './EMI.module.scss';

interface EMIComponentProps {
    activeFundingSourceElement: UIElement | null;
    showPayButton?: boolean;
    payButton(props: PayButtonProps): h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

export function EMIComponent({
    activeFundingSourceElement,
    showPayButton,
    payButton,
    setComponentRef
}: Readonly<EMIComponentProps>): h.JSX.Element | null {
    const [status, setStatus] = useState<UIElementStatus>('ready');

    const emiRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {}
    });

    useEffect(() => {
        setComponentRef(emiRef.current);
    }, [setComponentRef]);

    if (!activeFundingSourceElement) {
        return null;
    }

    return (
        <div className={styles.emiWrapper}>
            <div className={styles.emiFundingSourceForm}>{activeFundingSourceElement.render()}</div>
            {showPayButton && payButton({ status })}
        </div>
    );
}

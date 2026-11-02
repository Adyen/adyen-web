import { Fragment, h } from 'preact';
import { useEffect } from 'preact/hooks';

import { useCoreContext } from '../../../core/Context/CoreProvider';
import Button from '../../internal/Button';
import { ResultPanel } from '../../internal/ResultPanel';
import { BECS_SERVICE_AGREEMENT_URL } from '../constants';

import type { ActionHandledReturnObject } from '../../../types/global-types';

import styles from '../BECS.module.scss';

interface BECSResultProps {
    icon: string;
    onActionHandled?: (actionHandledObj: ActionHandledReturnObject) => void;
    paymentMethodType: string;
    url: string;
}

export function BECSResult({ icon, onActionHandled, paymentMethodType, url }: Readonly<BECSResultProps>) {
    const { i18n } = useCoreContext();

    useEffect(() => {
        onActionHandled?.({ componentType: paymentMethodType, actionDescription: 'voucher-presented' });
    }, []);

    return (
        <ResultPanel
            classNames={{ icon: styles.resultIcon, details: styles.details, actions: styles.actions }}
            icon={icon}
            iconAlt={i18n.get('becs.success.iconAlt')}
            title={i18n.get('becs.success.title')}
            description={i18n.get('becs.success.message')}
            details={
                <Fragment>
                    <h3 className={styles.actionsTitle}>{i18n.get('becs.success.actions.title')}</h3>
                    <p className={styles.actionsMessage}>{i18n.get('becs.success.actions.message')}</p>
                </Fragment>
            }
            actions={
                <Fragment>
                    <Button
                        inline
                        variant="ghost"
                        classNameModifiers={['wrap']}
                        href={url}
                        label={i18n.get('becs.success.action.authorisedRequest')}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                    <Button
                        inline
                        variant="ghost"
                        classNameModifiers={['wrap']}
                        href={BECS_SERVICE_AGREEMENT_URL}
                        label={i18n.get('becs.success.action.serviceAgreement')}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                </Fragment>
            }
        />
    );
}

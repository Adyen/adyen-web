import { h } from 'preact';

import { useCoreContext } from '../../../core/Context/CoreProvider';
import useImage from '../../../core/Context/useImage';
import Button from '../../internal/Button';
import { ResultPanel } from '../../internal/ResultPanel';

import styles from '../BECS.module.scss';

interface BECSResultProps {
    icon: string;
    url: string;
}

export function BECSResult({ icon, url }: Readonly<BECSResultProps>) {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const downloadIcon = getImage({ imageFolder: 'components/' })('download');

    return (
        <ResultPanel
            classNames={{ icon: styles.resultIcon }}
            icon={icon}
            iconAlt={i18n.get('becs.success.iconAlt')}
            title={i18n.get('becs.success.title')}
            description={i18n.get('becs.success.message')}
            details={
                <div>
                    <h3 className={styles.actionsTitle}>{i18n.get('becs.success.actions.title')}</h3>
                    <p className={styles.actionsMessage}>{i18n.get('becs.success.actions.message')}</p>
                </div>
            }
            actions={
                <div className={styles.actions}>
                    <Button
                        inline
                        variant="ghost"
                        href={url}
                        icon={downloadIcon}
                        label={i18n.get('becs.success.action.authorisedRequest')}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                    <Button
                        inline
                        variant="ghost"
                        href={url}
                        label={i18n.get('becs.success.action.serviceAgreement')}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                </div>
            }
        />
    );
}

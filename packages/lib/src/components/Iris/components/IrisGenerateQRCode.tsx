import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import useImage from '../../../core/Context/useImage';
import { UIElementStatus } from '../../types';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import styles from './IrisGenerateQRCode.module.scss';

interface IrisGenerateQRCodeProps {
    showPayButton?: boolean;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    status: UIElementStatus;
}

export default function IrisGenerateQRCode(props: Readonly<IrisGenerateQRCodeProps>) {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    return (
        <div>
            <p className={styles.instruction}>{i18n.get('iris.instructions.generateQrCode')}</p>
            {props.showPayButton &&
                props.payButton({
                    label: i18n.get('generateQRCode'),
                    icon: getImage({ imageFolder: 'components/' })('qr'),
                    status: props.status
                })}
        </div>
    );
}

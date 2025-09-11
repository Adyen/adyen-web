import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

const QRInstructions = ({ instructions }: { instructions: string | (() => h.JSX.Element) }) => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout__qr-loader__instructions">{typeof instructions === 'string' ? i18n.get(instructions) : instructions()}</div>
    );
};

export default QRInstructions;

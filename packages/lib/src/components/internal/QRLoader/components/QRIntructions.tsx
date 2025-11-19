import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

export const QRInstructions = ({ instructions }: { instructions: string | (() => h.JSX.Element) }) => {
    const { i18n } = useCoreContext();

    return <p className="adyen-checkout__qr-loader__instructions">{typeof instructions === 'string' ? i18n.get(instructions) : instructions()}</p>;
};

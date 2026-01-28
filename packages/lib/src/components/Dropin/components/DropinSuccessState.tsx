import { h } from 'preact';
import { useAmount } from '../../../core/Context/AmountProvider';
import Status from './status';

interface Props {
    message?: string;
}

const DropinSuccessState = ({ message }: Props) => {
    const { amount } = useAmount();
    return <Status.Success message={amount?.value === 0 ? 'resultMessages.preauthorized' : message} />;
};

export { DropinSuccessState };

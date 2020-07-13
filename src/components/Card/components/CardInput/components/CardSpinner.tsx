import classNames from 'classnames';
import { h } from 'preact';
import styles from '../CardInput.module.scss';
import Spinner from '../../../../internal/Spinner';

interface CardSpinnerProps {
    status: string;
}

const CardSpinner = ({ status }: CardSpinnerProps) => {
    const spinnerClassNames = classNames({
        [styles['card-input__spinner']]: true,
        [styles['card-input__spinner--active']]: status === 'loading'
    });

    return (
        <div className={spinnerClassNames}>
            <Spinner />
        </div>
    );
};

export default CardSpinner;

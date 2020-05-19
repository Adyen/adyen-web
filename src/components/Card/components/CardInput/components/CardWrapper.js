import classNames from 'classnames';
import { h } from 'preact';
import CardSpinner from './CardSpinner';
import styles from '../CardInput.module.scss';

const CardWrapper = ({ children, status }) => {
    const wrapperClass = classNames('adyen-checkout__card-input__form', styles['card-input__form'], {
        [styles['card-input__form--loading']]: status === 'loading'
    });

    return (
        <div style={{ position: 'relative' }}>
            <CardSpinner status={status} />
            <div className={wrapperClass}>{children}</div>
        </div>
    );
};

export default CardWrapper;

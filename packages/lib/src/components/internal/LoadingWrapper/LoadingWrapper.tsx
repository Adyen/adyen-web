import { ComponentChildren, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../../internal/Spinner';
import styles from './LoadingWrapper.module.scss';

interface LoadingWrapperProps {
    status?: string;
    children?: ComponentChildren;
}

const LoadingWrapper = ({ children, status }: LoadingWrapperProps) => {
    const wrapperClass = classNames('adyen-checkout__loading-input__form', styles['loading-input__form'], {
        [styles['loading-input__form--loading']]: status === 'loading'
    });

    const spinnerClass = classNames({
        [styles['loading-input__spinner']]: true,
        [styles['loading-input__spinner--active']]: status === 'loading'
    });

    return (
        <div style={{ position: 'relative' }}>
            <div className={spinnerClass}>
                <Spinner />
            </div>
            <div className={wrapperClass}>{children}</div>
        </div>
    );
};

export default LoadingWrapper;

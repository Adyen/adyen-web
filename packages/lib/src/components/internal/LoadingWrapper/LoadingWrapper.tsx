import { ComponentChildren, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../../internal/Spinner';
import './LoadingWrapper.scss';

interface LoadingWrapperProps {
    status?: string;
    children?: ComponentChildren;
}

const LoadingWrapper = ({ children, status }: LoadingWrapperProps) => {
    const wrapperClass = classNames('adyen-checkout__loading-input__form', 'loading-input__form', {
        'loading-input__form--loading': status === 'loading'
    });

    const spinnerClass = classNames({
        'loading-input__spinner': true,
        'loading-input__spinner--active': status === 'loading'
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

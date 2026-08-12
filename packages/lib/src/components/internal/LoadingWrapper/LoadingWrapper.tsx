import { ComponentChildren, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../../internal/Spinner';
import { useLoadingA11yReporter } from '../../../core/Errors/useLoadingA11yReporter';
import './LoadingWrapper.scss';

interface LoadingWrapperProps {
    status?: string;
    children?: ComponentChildren;
}

const LoadingWrapper = ({ children, status }: Readonly<LoadingWrapperProps>) => {
    // Announce the loading status to screen readers, since the spinner itself has no accessible name
    useLoadingA11yReporter(status === 'loading');

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

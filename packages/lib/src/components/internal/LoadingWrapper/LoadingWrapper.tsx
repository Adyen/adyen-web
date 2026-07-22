import { ComponentChildren, h } from 'preact';
import classNames from 'classnames';
import Spinner from '../../internal/Spinner';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { useA11yReporter } from '../../../core/Errors/useA11yReporter';
import './LoadingWrapper.scss';

interface LoadingWrapperProps {
    status?: string;
    children?: ComponentChildren;
}

const LoadingWrapper = ({ children, status }: Readonly<LoadingWrapperProps>) => {
    const { i18n } = useCoreContext();

    // Announce the loading status to screen readers, since the spinner itself has no accessible name
    useA11yReporter(status === 'loading' ? i18n.get('loading') : null);

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

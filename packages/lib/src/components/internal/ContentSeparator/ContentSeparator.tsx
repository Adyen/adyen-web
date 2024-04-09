import { h } from 'preact';
import classnames from 'classnames';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import './ContentSeparator.scss';

interface ContentSeparatorProps {
    label?: string;
    classNames?: string[];
}

function ContentSeparator({ label = 'qrCodeOrApp', classNames = [] }: ContentSeparatorProps) {
    const { i18n } = useCoreContext();
    return <div className={classnames('adyen-checkout__content-separator', ...classNames)}>{i18n.get(label)}</div>;
}

export default ContentSeparator;

import { h, ComponentChildren } from 'preact';
import cx from 'classnames';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import './Fieldset.scss';

interface FieldsetProps {
    children: ComponentChildren;
    classNameModifiers?: string[];
    label?: string;
    readonly?: boolean;
}

export default function Fieldset({ children, classNameModifiers = [], label, readonly = false }: FieldsetProps) {
    const { i18n } = useCoreContext();

    return (
        <fieldset
            className={cx([
                'adyen-checkout__fieldset',
                ...classNameModifiers.map(m => `adyen-checkout__fieldset--${m}`),
                { 'adyen-checkout__fieldset--readonly': readonly }
            ])}
        >
            {label && <legend className="adyen-checkout__fieldset__title">{i18n.get(label)}</legend>}

            <div className="adyen-checkout__fieldset__fields">{children}</div>
        </fieldset>
    );
}

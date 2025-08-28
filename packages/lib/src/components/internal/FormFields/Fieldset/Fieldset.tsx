import { h, ComponentChildren } from 'preact';
import cx from 'classnames';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import './Fieldset.scss';
import { getUniqueId } from '../../../../utils/idGenerator';

interface FieldsetProps {
    children: ComponentChildren;
    classNameModifiers?: string[];
    label?: string;
    description?: string;
    readonly?: boolean;
    id?: string;
}

export default function Fieldset({ children, classNameModifiers = [], label, readonly = false, description, id }: FieldsetProps) {
    const { i18n } = useCoreContext();

    const describedById = getUniqueId('fieldset-description');

    return (
        <fieldset
            id={id}
            className={cx([
                'adyen-checkout__fieldset',
                ...classNameModifiers.map(m => `adyen-checkout__fieldset--${m}`),
                { 'adyen-checkout__fieldset--readonly': readonly }
            ])}
            aria-describedby={description ? describedById : null}
        >
            {label && <legend className="adyen-checkout__fieldset__title">{i18n.get(label)}</legend>}
            {description && (
                <p id={describedById} className="adyen-checkout__fieldset__description">
                    {i18n.get(description)}
                </p>
            )}
            <div className="adyen-checkout__fieldset__fields">{children}</div>
        </fieldset>
    );
}

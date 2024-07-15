import { h, ComponentChildren, toChildArray, ComponentChild, cloneElement, VNode } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './Fieldset.scss';

interface FieldsetProps {
    children: ComponentChildren;
    classNameModifiers: string[];
    label: string;
    readonly?: boolean;
    uniqueId?: string;
}

export default function Fieldset({ children, classNameModifiers = [], label, readonly = false, ...props }: FieldsetProps) {
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

            {/*propagate the uniqueId, if we've been given one*/}
            {props.uniqueId ? (
                <div className="adyen-checkout__fieldset__fields">
                    {toChildArray(children).map((child: ComponentChild): ComponentChild => {
                        return cloneElement(child as VNode, { uniqueId: props.uniqueId });
                    })}
                </div>
            ) : (
                <div className="adyen-checkout__fieldset__fields">{children}</div>
            )}
        </fieldset>
    );
}

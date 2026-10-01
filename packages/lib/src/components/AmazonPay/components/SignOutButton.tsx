import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { SignOutButtonProps } from '../types';

export default function SignOutButton(props: Readonly<SignOutButtonProps>) {
    const { i18n } = useCoreContext();

    const handleClick = () => {
        const signOutPromise = props.onSignOut ? new Promise((resolve, reject) => void props.onSignOut?.(resolve, reject)) : Promise.resolve();

        signOutPromise
            .then(() => {
                props.amazonRef.Pay.signout();
            })
            .catch(console.error);
    };

    return (
        <button
            type="button"
            className="adyen-checkout__button adyen-checkout__button--ghost adyen-checkout__amazonpay__button--signOut"
            onClick={handleClick}
        >
            {i18n.get('amazonpay.signout')}
        </button>
    );
}

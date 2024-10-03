import { h } from 'preact';
import classNames from 'classnames';
import { CVCHintProps } from './types';

export default function CVCHint({ frontCVC = false, fieldLabel }: CVCHintProps) {
    const hintClassnames = classNames({
        'adyen-checkout__card__cvc__hint__wrapper': true,
        'adyen-checkout__field__cvc--front-hint': !!frontCVC,
        'adyen-checkout__field__cvc--back-hint': !frontCVC
    });

    return (
        <span className={hintClassnames}>
            <svg
                className={'adyen-checkout__card__cvc__hint adyen-checkout__card__cvc__hint--front'}
                width="27"
                height="18"
                viewBox="0 0 27 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden={!frontCVC}
                aria-describedby={'adyen-checkout__cvc__front-hint-img'}
                role={'img'}
            >
                <title id={'adyen-checkout__cvc__front-hint-img'}>{fieldLabel}</title>
                <path
                    d="M0 3C0 1.34315 1.34315 0 3 0H24C25.6569 0 27 1.34315 27 3V15C27 16.6569 25.6569 18 24 18H3C1.34315 18 0 16.6569 0 15V3Z"
                    fill="#E6E9EB"
                />
                <rect x="4" y="12" width="19" height="2" fill="#B9C4C9" />
                <rect x="4" y="4" width="4" height="4" rx="1" fill="white" />
                <rect className={'adyen-checkout__card__cvc__hint__location'} x="16.5" y="4.5" width="7" height="5" rx="2.5" stroke="#C12424" />
            </svg>

            <svg
                className={'adyen-checkout__card__cvc__hint adyen-checkout__card__cvc__hint--back'}
                width="27"
                height="18"
                viewBox="0 0 27 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden={!!frontCVC}
                aria-describedby={'adyen-checkout__cvc__back-hint-img'}
                role={'img'}
            >
                <title id={'adyen-checkout__cvc__back-hint-img'}>{fieldLabel}</title>
                <path
                    d="M27 4.00001V3.37501C27 2.4799 26.6444 1.62146 26.0115 0.988518C25.3786 0.355581 24.5201 0 23.625 0H3.375C2.47989 0 1.62145 0.355581 0.988514 0.988518C0.355579 1.62146 0 2.4799 0 3.37501V4.00001H27Z"
                    fill="#E6E9EB"
                />
                <path
                    d="M0 6.99994V14.6666C0 15.5507 0.355579 16.3985 0.988514 17.0237C1.62145 17.6488 2.47989 18 3.375 18H23.625C24.5201 18 25.3786 17.6488 26.0115 17.0237C26.6444 16.3985 27 15.5507 27 14.6666V6.99994H0Z"
                    fill="#E6E9EB"
                />
                <rect y="4.00012" width="27" height="3.00001" fill="#687282" />
                <path
                    d="M4 11C4 10.4477 4.44772 10 5 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H5C4.44771 14 4 13.5523 4 13V11Z"
                    fill="white"
                />
                <rect className={'adyen-checkout__card__cvc__hint__location'} x="16.5" y="9.5" width="7" height="5" rx="2.5" stroke="#C12424" />
            </svg>
        </span>
    );
}

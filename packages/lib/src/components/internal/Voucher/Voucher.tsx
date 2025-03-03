import { h } from 'preact';
import classNames from 'classnames';
import Button from '../Button';
import { copyToClipboard } from '../../../utils/clipboard';

import { useCoreContext } from '../../../core/Context/CoreProvider';
import './Voucher.scss';
import { VoucherProps } from './types';
import useImage from '../../../core/Context/useImage';
import { PREFIX } from '../Icon/constants';
import DetailsTable from '../DetailsTable';

export default function Voucher({ voucherDetails = [], className = '', ...props }: VoucherProps) {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    props.onActionHandled?.({ componentType: props.paymentMethodType, actionDescription: 'voucher-presented' });

    return (
        <div className={classNames('adyen-checkout__voucher-result', `adyen-checkout__voucher-result--${props.paymentMethodType}`, className)}>
            <div className="adyen-checkout__voucher-result__top">
                <div className="adyen-checkout__voucher-result__image">
                    {!!props.imageUrl && (
                        <span className="adyen-checkout__voucher-result__image__wrapper">
                            <img alt={props.paymentMethodType} className="adyen-checkout__voucher-result__image__brand" src={props.imageUrl} />
                        </span>
                    )}

                    {!!props.issuerImageUrl && (
                        <span className="adyen-checkout__voucher-result__image__wrapper">
                            <img alt={props.paymentMethodType} className="adyen-checkout__voucher-result__image__issuer" src={props.issuerImageUrl} />
                        </span>
                    )}
                </div>

                <div className="adyen-checkout__voucher-result__introduction">
                    {props.introduction}{' '}
                    {props.instructionsUrl && (
                        <a
                            className="adyen-checkout-link adyen-checkout-link--voucher-result-instructions"
                            href={props.instructionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {i18n.get('voucher.readInstructions')} ›
                        </a>
                    )}
                </div>

                {props.amount && (
                    <div className="adyen-checkout__voucher-result__amount">
                        {props.amount}

                        {props.surcharge && (
                            <span className="adyen-checkout__voucher-result__surcharge">
                                ({i18n.get('voucher.surcharge').replace('%@', props.surcharge)})
                            </span>
                        )}
                    </div>
                )}
            </div>

            {props.reference && (
                <div className="adyen-checkout__voucher-result__separator">
                    <div className="adyen-checkout__voucher-result__separator__inner" />
                    <div className="adyen-checkout__voucher-result__code__label">
                        <span className="adyen-checkout__voucher-result__code__label__text">{i18n.get('voucher.paymentReferenceLabel')}</span>
                    </div>
                </div>
            )}

            <div className="adyen-checkout__voucher-result__bottom">
                {props.reference && (
                    <div className="adyen-checkout__voucher-result__code">
                        {props.barcode && (
                            <img
                                alt={i18n.get('voucher.paymentReferenceLabel')}
                                className="adyen-checkout__voucher-result__code__barcode"
                                src={props.barcode}
                            />
                        )}
                        <span>{props.reference}</span>
                    </div>
                )}

                {(!!props.downloadUrl || !!props.copyBtn) && (
                    <ul className="adyen-checkout__voucher-result__actions">
                        {!!props.copyBtn && (
                            <li className="adyen-checkout__voucher-result__actions__item">
                                <Button
                                    inline
                                    variant="action"
                                    onClick={(e, { complete }) => {
                                        copyToClipboard(props.reference);
                                        complete();
                                    }}
                                    icon={getImage({ imageFolder: 'components/' })(`${PREFIX}copy`)}
                                    label={i18n.get('button.copy')}
                                />
                            </li>
                        )}

                        {!!props.downloadUrl && (
                            <li className="adyen-checkout__voucher-result__actions__item">
                                <Button
                                    inline
                                    variant="action"
                                    href={props.downloadUrl}
                                    icon={getImage({ imageFolder: 'components/' })(`${PREFIX}download`)}
                                    label={props.downloadButtonText || i18n.get('button.download')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            </li>
                        )}
                    </ul>
                )}

                <DetailsTable tableFields={voucherDetails} />
            </div>
        </div>
    );
}

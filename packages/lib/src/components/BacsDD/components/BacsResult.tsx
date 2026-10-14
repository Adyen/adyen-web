import { Fragment, h } from 'preact';

import { useCoreContext } from '../../../core/Context/CoreProvider';
import useImage from '../../../core/Context/useImage';
import Button from '../../internal/Button';
import { PREFIX } from '../../internal/Icon/constants';
import { ResultPanel } from '../../internal/ResultPanel';

import '../../internal/Voucher/Voucher.scss';
import './BacsResult.scss';

const BacsResult = props => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    props.onActionHandled?.({ componentType: props.paymentMethodType, actionDescription: 'voucher-presented' });

    return (
        <ResultPanel
            classNames={{
                root: `adyen-checkout__bacs-result adyen-checkout__voucher-result adyen-checkout__voucher-result--${props.paymentMethodType}`,
                details: 'adyen-checkout__bacs-result__top adyen-checkout__voucher-result__top',
                actions: 'adyen-checkout__bacs-result__bottom adyen-checkout__voucher-result__bottom'
            }}
            details={
                <Fragment>
                    <div className="adyen-checkout__voucher-result__image">
                        <span className="adyen-checkout__voucher-result__image__wrapper">
                            <img
                                alt={props.paymentMethodType}
                                className="adyen-checkout__voucher-result__image__brand"
                                src={getImage()(props.paymentMethodType)}
                            />
                        </span>
                    </div>
                    <div className="adyen-checkout__voucher-result__introduction">{i18n.get('bacs.result.introduction')}</div>
                </Fragment>
            }
            actions={
                <ul className="adyen-checkout__voucher-result__actions">
                    <li className="adyen-checkout__voucher-result__actions__item">
                        <Button
                            inline
                            variant="action"
                            href={props.url}
                            icon={getImage({ imageFolder: 'components/' })(`${PREFIX}download`)}
                            label={i18n.get('download.pdf')}
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    </li>
                </ul>
            }
        />
    );
};

export default BacsResult;

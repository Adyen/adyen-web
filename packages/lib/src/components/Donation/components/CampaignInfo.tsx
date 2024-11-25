import { Fragment, h } from 'preact';
import Img from '../../internal/Img';

export interface CampaignInfoProps {
    logoUrl?: string;
    nonprofitName?: string;
    causeName?: string;
    bannerUrl?: string;
}

export default function CampaignInfo({ logoUrl = '', nonprofitName = '', causeName = '', bannerUrl = '' }: CampaignInfoProps) {
    const backgroundImage = `url(${bannerUrl})`;

    return (
        <Fragment>
            <Img className="adyen-checkout__campaign-background-image" style={{ backgroundImage }} backgroundUrl={bannerUrl} />

            <div className="adyen-checkout__campaign-content">
                {logoUrl && <img src={logoUrl} className="adyen-checkout__campaign-logo" alt={nonprofitName} />}
                <div>
                    {nonprofitName && <div className="adyen-checkout__campaign-title">{nonprofitName}</div>}
                    {causeName && <div className="adyen-checkout__campaign-cause">{causeName}</div>}
                </div>
            </div>
        </Fragment>
    );
}

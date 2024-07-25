import { h } from 'preact';
import Img from '../../internal/Img';

export interface CampaignContentProps {
    logoUrl?: string;
    nonprofitDescription?: string;
    nonprofitName?: string;
    causeName?: string;
    nonprofitUrl?: string;
    bannerUrl?: string;
}

export default function CampaignContent({
    logoUrl = '',
    nonprofitDescription = '',
    nonprofitName = '',
    causeName = '',
    nonprofitUrl = '',
    bannerUrl = ''
}: CampaignContentProps) {
    const backgroundImage = `linear-gradient(0, #000, #0003), url(${bannerUrl})`;

    return (
        <div className="adyen-checkout__campaign-container">
            <Img className="adyen-checkout__campaign-background-image" style={{ backgroundImage }} backgroundUrl={bannerUrl} />

            <div className="adyen-checkout__campaign-content">
                {logoUrl && <img src={logoUrl} className="adyen-checkout__campaign-logo" alt={nonprofitName} />}
                {nonprofitName && <div className="adyen-checkout__campaign-title">{nonprofitName}</div>}
                {causeName && <div className="adyen-checkout__campaign-cause">{causeName}</div>}
                {nonprofitDescription && (
                    <div className="adyen-checkout__campaign-description">
                        {nonprofitDescription}
                        {nonprofitUrl && ' ›'}
                    </div>
                )}
            </div>
        </div>
    );
}

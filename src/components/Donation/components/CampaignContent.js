import { h } from 'preact';
import Img from '../../internal/Img';

export default function CampaignContent({ description = '', name = '', logoUrl = '', url = '', backgroundUrl = '' }) {
    const backgroundImage = `linear-gradient(0, #000, #0003), url(${backgroundUrl})`;

    return (
        <div className="adyen-checkout__campaign-container">
            <Img className="adyen-checkout__campaign-background-image" style={{ backgroundImage }} backgroundUrl={backgroundUrl} />

            <div className="adyen-checkout__campaign-content">
                {logoUrl && <img src={logoUrl} className="adyen-checkout__campaign-logo" alt={name} />}
                {name && <div className="adyen-checkout__campaign-title">{name}</div>}
                {description && (
                    <div className="adyen-checkout__campaign-description">
                        {description}
                        {url && ' ›'}
                    </div>
                )}
            </div>
        </div>
    );
}

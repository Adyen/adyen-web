import { h } from 'preact';
import './Timeline.scss';

interface Timeline {
    instructions: string[];
}

const Timeline = ({ instructions }: Timeline) => {
    if (!instructions || instructions.length === 0) {
        return null;
    }

    return (
        <ol className="adyen-checkout-timeline">
            {instructions.map((value, index) => (
                <li className="adyen-checkout-timeline__item" key={index}>
                    <div className="adyen-checkout-timeline__item-content">
                        <p className="adyen-checkout-timeline__item-description">{value}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
};

export default Timeline;

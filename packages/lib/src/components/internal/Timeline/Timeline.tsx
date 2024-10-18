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
        <div className="adyen-checkout-timeline">
            <ol className="adyen-checkout-timeline__items">
                {instructions.map((value, index) => (
                    <li className="adyen-checkout-timeline-item" key={index}>
                        <div className="adyen-checkout-timeline-item__row">
                            <div aria-hidden="true" className="adyen-checkout-timeline-item__marker">
                                <svg role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
                                    <path
                                        fill="#00112C"
                                        d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V10.5C3.25 11.7426 4.25736 12.75 5.5 12.75H10.5C11.7426 12.75 12.75 11.7426 12.75 10.5V5.5C12.75 4.25736 11.7426 3.25 10.5 3.25H5.5Z"
                                    ></path>
                                </svg>
                                <div className="adyen-checkout-timeline-item__separator"></div>
                            </div>
                            <div className="adyen-checkout-timeline-item__content">
                                <div className="adyen-checkout-timeline-item__title">{value}</div>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export { Timeline };

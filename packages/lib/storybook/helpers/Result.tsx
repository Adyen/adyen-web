interface IResult {
    resultCode?: string;
    resultMessage?: string;
}

export const Result = ({ resultCode, resultMessage }: IResult) => {
    const isAuthorized = resultCode === 'Authorised' || resultCode === 'Received';
    const imgSrc = isAuthorized
        ? 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif'
        : 'https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.gif';
    const imgAlt = isAuthorized ? 'success' : 'error';

    return (
        <div className="redirect-result">
            <img src={imgSrc} alt={imgAlt} className="result-img"></img>
            {resultCode} {resultMessage}
        </div>
    );
};

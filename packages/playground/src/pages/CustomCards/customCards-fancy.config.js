/// Fancy card
const cardHolderDiv = document.querySelector('.fancy-secured-fields');
const holderNameDiv = document.querySelector('.fancy-input-field--holdername');
const flipButton = document.getElementsByClassName('fancy-card__flip-card');
let currentCard = null;

export const fancyChangeBrand = brandObject => {
    if (currentCard === brandObject.brand) {
        cardHolderDiv.classList.toggle(`fancy-secured-fields--${brandObject.brand}`);
    } else {
        if (currentCard !== null) {
            cardHolderDiv.classList.toggle(`fancy-secured-fields--${currentCard}`);
        }
        cardHolderDiv.classList.toggle(`fancy-secured-fields--${brandObject.brand}`);
        currentCard = brandObject.brand;
    }

    cardHolderDiv.querySelector('.card-image').setAttribute('src', brandObject.brandImageUrl);
};

export const fancyErrors = errorObject => {
    console.error('fancy errors', errorObject);
};

export const fancyFieldValid = field => {
    console.log(field);
};

Array.prototype.forEach.call(flipButton, button => {
    button.addEventListener(
        'click',
        () => {
            cardHolderDiv.classList.toggle('rotated');
        },
        false
    );
});

export const fancyFocus = focusObject => {
    console.log(focusObject);
    if (focusObject.focus === true && focusObject.fieldType === 'encryptedSecurityCode') {
        //  cardHolderDiv.classList.toggle('rotated');
        // fancyCustomCard.updateStyles(fancyStylesToUpdate);
    } else if (focusObject.focus === false && focusObject.fieldType === 'encryptedSecurityCode') {
        cardHolderDiv.classList.toggle('rotated');
        fancyCustomCard.updateStyles(fancyStyles);
        holderNameDiv.focus();
    }
};

export const fancyStyles = {
    base: {
        fontSize: '18px',
        color: '#FFFFFE',
        letterSpacing: '-1.1px',
        wordSpacing: '3px',
        fontFamily: '"Fakt", sans-serif',
        fontWeight: 'bold',
        outline: '0',
        border: '0'
    },
    error: {
        color: 'red'
    },
    placeholder: {
        color: 'rgba(255, 255, 255, 0.6)'
    }
};

const fancyStylesToUpdate = {
    base: {
        fontSize: '18px',
        color: '#fff',
        letterSpacing: '-1.1px',
        wordSpacing: '3px',
        fontFamily: '"Fakt", sans-serif',
        fontWeight: 'bold',
        outline: '0',
        border: '0'
    },
    error: {
        color: 'red'
    },
    placeholder: {
        color: 'rgba(255, 255, 255, 0.6)'
    }
};

const convertFullToHalf = str => str.replace(/[！-～]/g, r => String.fromCharCode(r.charCodeAt(0) - 0xfee0));

export { convertFullToHalf };

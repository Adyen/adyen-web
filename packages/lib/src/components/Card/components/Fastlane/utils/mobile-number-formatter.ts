function mobileNumberFormatter(value: string): string {
    let input = value;
    // Allow only numbers
    input = input.replace(/\D/g, '');

    // Add spaces at the appropriate positions
    if (input.length > 3 && input.length <= 6) {
        input = input.slice(0, 3) + ' ' + input.slice(3);
    } else if (input.length > 6) {
        input = input.slice(0, 3) + ' ' + input.slice(3, 6) + ' ' + input.slice(6, 10);
    }
    return input;
}

export default mobileNumberFormatter;

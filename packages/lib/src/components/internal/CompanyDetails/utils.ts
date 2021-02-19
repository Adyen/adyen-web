export const getFormattedData = data => {
    const { name, registrationNumber } = data;
    return {
        ...((name || registrationNumber) && {
            company: {
                ...(name && { name }),
                ...(registrationNumber && { registrationNumber })
            }
        })
    };
};

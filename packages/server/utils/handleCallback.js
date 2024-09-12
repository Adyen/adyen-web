module.exports = async (response, res) => {
    try {
        if (!response.ok) {
            console.error(`Request to ${res.req.url} ended with status ${response.status} - ${response.statusText}`);
            return res.status(response.status).send({
                status: response.status,
                message: response.statusText
            });
        }

        const body = await response.json();
        res.send(body);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

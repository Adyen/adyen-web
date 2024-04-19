const fs = require('fs');
const path = require('path');

module.exports = (res, req) => {
    const locale = req.params.locale;

    try {
        const jsonString = fs.readFileSync(path.resolve(__dirname, `../translations/${locale}.json`), { encoding: 'utf-8' });
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.log(`ERROR: Localhost Server /translations endpoint error - ${error.message}`);
        res.status(500).end();
    }
};

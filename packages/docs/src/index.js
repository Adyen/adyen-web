const { parseDocs } = require('./generateDocs');
const jsonDefinition = require('../dist/docs.json');

parseDocs(jsonDefinition);

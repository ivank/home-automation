const encode = require('./codec').encode;
const fs = require('fs')
const path = require('path')

fs.readdirSync(path.join(__dirname, 'data/decoded')).forEach(function (file) {
	const filename = path.join(__dirname, 'data/decoded', file);
	const data = fs.readFileSync(filename).toString().split("\n");

	fs.writeFileSync(path.join(__dirname, 'data/encoded', file), encode(data).join(",\n"));
});
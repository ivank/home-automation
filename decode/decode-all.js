const decode = require('./codec').decode;
const fs = require('fs')
const path = require('path')

fs.readdirSync(path.join(__dirname, 'data/raw')).forEach(function (file) {
	const filename = path.join(__dirname, 'data/raw', file);
	const data = fs.readFileSync(filename).toString().split("\n").map(value => Number(value));

	fs.writeFileSync(path.join(__dirname, 'data/decoded', file), decode(data).join(""));
});
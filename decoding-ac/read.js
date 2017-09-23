const { chunk, filter, map, drop, flow, join, split } = require('lodash/fp');

const processData = flow(
    split('\n'),
    filter(line => line.match(/^(space)/)),
    map(line => line.match(/^space (\d+)/)),
    drop(2),
    map(line => Number(line[1]) > 1000 ? 1 : 0),
    chunk(8),
    map(join('')),
    join('\n')
);
let data = '';

process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
    data += process.stdin.read();

    console.log(data);

    if (data.split('\n').length >= 5) {
        process.stdout.write(processData(data) + '\n');
        data = '';
    }
});

// process.stdin.on('end', () => {
//     process.stdout.write(processData(data) + '\n');
// });
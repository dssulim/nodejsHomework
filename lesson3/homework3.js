// регулярка:   /34\.48\.240\.111.*/gm
//              /89\.123\.1\.41.*/gm
const fs = require('fs');
const {Transform} = require('stream');

const readStream = fs.createReadStream('./access.log', 'utf-8');
const writeStream_34_48_240_111 = fs.createWriteStream('./34_48_240_111_requests.log', {flags: 'a', encoding: 'utf-8'});
const writeStream_89_123_1_41 = fs.createWriteStream('./89_123_1_41_requests.log', {flags: 'a', encoding: 'utf-8'});

const transformStream34 = new Transform({
    transform(chunk, encoding, callback){
        const transformedChunk = chunk.toString().match(new RegExp('34\.48\.240\.111.*', 'gm'));
        callback(null, transformedChunk.join('\n'));
    }
});

const transformStream89 = new Transform({
    transform(chunk, encoding, callback){
        const transformedChunk = chunk.toString().match(new RegExp('89\.123\.1\.41.*', 'gm'));
        callback(null, transformedChunk.join('\n'));
    }
});




readStream.pipe(transformStream34).pipe(writeStream_34_48_240_111);
readStream.pipe(transformStream89).pipe(writeStream_89_123_1_41);
console.log('Done!');
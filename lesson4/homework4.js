const fs = require('fs');
const {Transform} = require('stream');
const path = require('path');
const inquirer = require('inquirer');
const readline = require('readline');
const yargs = require('yargs');

const options = yargs.usage('Usage: -s <search>').option('s', {
    alias: 'search',
    describe: 'Найти. Можно по шаблону регулярки. ',
    type: 'string',
    demandOption: false
}).argv;    //console.log(options.search);

let searchResult = [];

const isFile = (fileName)=>{
    return fs.lstatSync(fileName).isFile();
}

const main = async (filePath) => {
    const list = fs.readdirSync(filePath);//.filter(isFile);  //array
    list.unshift('..');
    const answer = await inquirer.prompt([
        {
            name: 'fileName',
            type: 'list',
            message: 'Choose file: ',
            choices: list
        }
    ]);

    filePath = path.join(filePath, answer.fileName);
    if(isFile(filePath)){
        if(options.search){
            console.log(options.search);
            const readStream = fs.createReadStream(filePath, 'utf-8');
            const transformStream = new Transform({
                transform(chunk, encoding, callback){
                    const transformedChunk = chunk.toString().match(new RegExp(options.search, 'gm'));
                    let count = 0;
                    if(transformedChunk) count = transformedChunk.length;
                    callback(null, `Искомый элемент (${options.search}) встречается в файле (${filePath}) ${count} раз(a).`);
                }
            });
            readStream.pipe(transformStream).pipe(process.stdout);
        } else {
            console.log(filePath);
            const data = fs.readFileSync(filePath, 'utf-8');
            console.log(data);
        }

    } else main(filePath);

    
}

main(__dirname);
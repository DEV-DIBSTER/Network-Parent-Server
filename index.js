const ExpressJS = require('express');
const fs = require('fs');
const BodyParser = require('body-parser');
const Axios = require('axios');
const Chalk = require('chalk');
const { GetTime } = require('./functions.js');

const Configuration = require('./config.json');
const Exec = require('child_process').exec;

const Server = ExpressJS();
Server.set('json spaces', 2);
Server.use(BodyParser.json(), BodyParser.urlencoded({extended: true}));

Server.get('/', async (Request, Response) => {
    Response.status(404).send('Nothing to see here!');
});

setInterval(() => {
    Exec(`git pull`, (Error, Stdout) => {
        let Response = (Error || Stdout);
        if (!Error) {
            if (Response.includes("Already up to date.")) {

            } else {
                Exec('pm2 restart all');
            };
        };
    });
}, 30 * 1000);

Server.post('/stats', async (Request, Response) => {
    if(!Configuration.Nodes.some(Node => Node.Incoming_Password == Request.headers.password)) return Response.status(403).send('Invalid Authentication.');

    const Node = Configuration.Nodes.filter(Node => Node.Incoming_Password == Request.headers.password)[0];

    const JSON_Response = Request.body;
    fs.writeFileSync(`./Stats/${Node.Name}.json`, JSON.stringify(JSON_Response, null, 4));

    const Date = await GetTime();

    Response.status(202).send('Data has been successfully saved.');

    const Text = Chalk.bold.greenBright('[Server] | ');
    const Text2 = Chalk.bold.blueBright(`${Date.Time}`);
    const Text3 = Chalk.bold.greenBright(' Data has successfully been saved. Node: ');
    const Text4 = Chalk.bold.redBright(Node.Name);

    console.log(`${Text}${Text2}${Text3}${Text4}`);
});

Server.get('/stats', async (Request, Response) => {
    let ResponseData = [];

    fs.readdirSync('./Stats/').forEach(m => {
        delete require.cache[require.resolve(`./Stats/${m}`)];
        const FileData = require(`./Stats/${m}`);
        ResponseData.push(FileData);
    });

    Response.status(200).json(ResponseData);
});

Server.get('/stats/:id', async (Request, Response) => {
    const Node = Request.params.id;

    if(!fs.readdirSync('./Stats/').some(File => File.replace('.json', '') == Node)) return Response.status(404).send('Invalid Parameters Provided.'); //Not a Valid Node.
    
    delete require.cache[require.resolve(`./Stats/${Node}`)];
    const NodeFile = require(`./Stats/${Node}.json`);

    Response.status(200).json(NodeFile);
});

Server.listen(Configuration.Port, function () {
    const Divider = Chalk.blueBright('------------------------------------------------------\n');
    const Text = Chalk.redBright('██████╗ ██╗██████╗ ███████╗████████╗███████╗██████╗\n██╔══██╗██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗\n██║  ██║██║██████╔╝███████╗   ██║   █████╗  ██████╔╝\n██║  ██║██║██╔══██╗╚════██║   ██║   ██╔══╝  ██╔══██╗\n██████╔╝██║██████╔╝███████║   ██║   ███████╗██║  ██║\n╚═════╝ ╚═╝╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝\n');

    console.log(`${Divider}${Text}${Divider}`);    
    console.log(`${Chalk.greenBright(`[Server] | `)}${Chalk.bold.blueBright(`Server is online at: ${Configuration.URL} at port ${Configuration.Port}!`)}`);
});

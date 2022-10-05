const ExpressJS = require('express');
const OS = require('os');
const fs = require('fs');
const SI = require('systeminformation');
const PrettySizeJS = require('prettysize');
const BodyParser = require('body-parser');
const Axios = require('axios');

const Configuration = require('./config.json');
const Exec = require('child_process').exec;

const Server = ExpressJS();
Server.set('json spaces', 2);
Server.use(BodyParser.json(), BodyParser.urlencoded({extended: true}));

Server.get('/', async (Request, Response) => {
    Response.status(404).send('Nothing to see here!');
});

Server.post('/stats', async (Request, Response) => {
    if(!Configuration.Nodes.some(Node => Node.Incoming_Password == Request.headers.password)) return Response.status(403).send('Invalid Authentication.');
    if(!Configuration.Nodes.some(Node => Node.Domain == Request.hostname)) return Response.status(403).send('Invalid Authentication.');

    const Check1 = Configuration.Nodes.filter(Node => Node.Incoming_Password == Request.headers.password)[0];
    const Check2 = Configuration.Nodes.filter(Node => Node.Domain == Request.hostname)[0];

    if(Check1.Name != Check2.Name) return Response.status(403).send('Invalid Authentication.');

    const Node = Configuration.Nodes.filter(Node => Node.Incoming_Password == Request.headers.password)[0];

    const JSON_Response = Request.body;

    fs.writeFileSync(`./Stats/${Node.Name}.json`, JSON.stringify(JSON_Response, null, 4));

    Response.status(202).send('Data has been successfully saved.');
    console.log(`[Server] | Data has sucessfully been saved. Node: ${Node.Name}`);
});

Server.listen(Configuration.Port, function () {
    console.log('-----------------------------------------------------------\n██████╗░██╗██████╗░░██████╗████████╗███████╗██████╗░\n██╔══██╗██║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗\n██║░░██║██║██████╦╝╚█████╗░░░░██║░░░█████╗░░██████╔╝\n██║░░██║██║██╔══██╗░╚═══██╗░░░██║░░░██╔══╝░░██╔══██╗\n██████╔╝██║██████╦╝██████╔╝░░░██║░░░███████╗██║░░██║\n╚═════╝░╚═╝╚═════╝░╚═════╝░░░░╚═╝░░░╚══════╝╚═╝░░╚═╝\n-----------------------------------------------------------')    
    console.log(`[Server] | Server is online at: ${Configuration.URL} at port ${Configuration.Port}!`);
});
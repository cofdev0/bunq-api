import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import fs = require('fs');
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateTimeString = dt.format('YmdHMS');

const setup:BunqApiSetup=new BunqApiSetup(new BunqConnection());
const config:BunqApiConfig = new BunqApiConfig();
const deviceServerConfig = config.readJson(config.json.deviceServerConfigFile);
const privateKeyPem:string=config.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig = config.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;

setup.createSessionServer(key, deviceServerConfig.secret, installationToken).then(function(response:string){
    console.log(response);
    fs.mkdir("../keys/sessions");
    fs.writeFileSync("../keys/sessions/bunqSession_"+dateTimeString+".json", response);
    fs.writeFileSync("../keys/bunqSession.json", response);
    let resp : any = JSON.parse(response);
    console.log("created session server id: "+resp.Response[1].Token.id);
    console.log("created session server token: "+resp.Response[1].Token.token);
}).catch(function(error:string){
    console.log("error : "+error);
});
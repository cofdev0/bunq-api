import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import * as fs from "fs-extra";
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateTimeString = dt.format('YmdHMS');


const config:BunqApiConfig = new BunqApiConfig();
const deviceServerConfig = BunqApiConfig.readJson(config.json.secretsFile);
const privateKeyPem:string=BunqApiConfig.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const setup:BunqApiSetup=new BunqApiSetup(new BunqConnection(),key,deviceServerConfig.secret,installationToken);

setup.createSessionServer().then(function(response:string){
    console.log(response);
    fs.ensureDirSync(config.json.bunqSessionHistoryPath);
    fs.writeFileSync(config.json.bunqSessionHistoryPath+"/bunqSession_"+dateTimeString+".json", response);
    fs.writeFileSync(config.json.bunqSessionFile, response);
    let resp : any = JSON.parse(response);
    console.log("created session server id: "+resp.Response[1].Token.id);
    console.log("created session server token: "+resp.Response[1].Token.token);
}).catch(function(error:string){
    console.log("error : "+error);
});
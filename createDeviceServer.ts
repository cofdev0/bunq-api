import fs = require('fs');
import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateTimeString = dt.format('YmdHMS');


const config:BunqApiConfig = new BunqApiConfig();
const deviceServerConfig = BunqApiConfig.readJson(config.json.deviceServerConfigFile);
const key : BunqKey = BunqKey.createFromPrivateKeyFile(config.json.privateKeyFile);
const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const setup:BunqApiSetup=new BunqApiSetup(new BunqConnection(),key, deviceServerConfig.secret,installationToken);

setup.createDeviceServer(deviceServerConfig.description).then(function(response:string){
    console.log(response);
    fs.writeFileSync("../keys/bunqDeviceServerResponse"+dateTimeString+".json", response);
    let resp : any = JSON.parse(response);
    console.log("created device server id: "+resp.Response[0].Id.id);
}).catch(function(error:string){
    console.log("error : "+error);
});

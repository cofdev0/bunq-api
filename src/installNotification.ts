
import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";
import {BunqApi} from "./BunqApi";
import fs = require('fs');
const dateTime = require('node-datetime');
const dt = dateTime.create();
const dateTimeString = dt.format('YmdHMS');

const config:BunqApiConfig = new BunqApiConfig();
const secretConfig = BunqApiConfig.readJson(config.json.secretsFile);
const privateKeyPem:string=BunqApiConfig.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig:any = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const connect:BunqConnection = new BunqConnection();
const setup:BunqApiSetup=new BunqApiSetup(connect,key,secretConfig.secret,installationToken);
const bunqApi:BunqApi=new BunqApi(connect, key,secretConfig.secret,setup,
    config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);

bunqApi.setPubBunqKeyPem(installationTokenConfig.Response[2].ServerPublicKey.server_public_key);

if(process.argv.length<3){
    console.log("no notification url specified!");
    process.exit(-1);
}

console.log("callback url:"+process.argv[2]);
//const encodedUrl:string = encodeURIComponent(process.argv[2]);
//console.log("encoded url:"+encodedUrl);

bunqApi.installNotificationFilter(secretConfig.userId, secretConfig.accountId,process.argv[2]).then((response:string)=>{
    console.log(response);
    fs.writeFileSync(config.json.secretsPath+"/bunqInstallNotificationResponse_"+dateTimeString+".json", response);
}).catch(function(error:string){
    console.log("error:"+error);
});

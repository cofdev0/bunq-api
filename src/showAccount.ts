
import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";
import {BunqApi} from "./BunqApi";
import fs = require('fs');

const config:BunqApiConfig = new BunqApiConfig();
const deviceServerConfig = BunqApiConfig.readJson(config.json.secretsFile);
const privateKeyPem:string=BunqApiConfig.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const connect:BunqConnection = new BunqConnection();
const setup:BunqApiSetup=new BunqApiSetup(connect,key,deviceServerConfig.secret,installationToken);
const bunqApi:BunqApi=new BunqApi(connect, key,deviceServerConfig.secret,setup,
    config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);

bunqApi.setPubBunqKeyPem(installationTokenConfig.Response[1].ServerPublicKey.server_public_key);

bunqApi.requestMonetaryAccountBank(deviceServerConfig.userId, deviceServerConfig.accountId).then((response:any)=>{
    console.log(response.headers);
    console.log(response.body);
    fs.writeFileSync(config.json.secretsPath+"/requestMABResponse.json", response.body);
    let resp:any = JSON.parse(response.body);
    console.log("balance: "+resp.Response[0].MonetaryAccountBank.balance.value);
}).catch(function(error:string){
    console.log(error);
    expect(true).toBeFalsy();
});


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


bunqApi.sendPayment(deviceServerConfig.userId, deviceServerConfig.accountId,
    "0.33",deviceServerConfig.counterPartyIban,"60ea16bc8df8e1f39845","15JWLB5m9qGNxvt8tHJ").then((response:string)=>{
    console.log(response);
    fs.writeFileSync(config.json.secretsPath+"/sendPaymentResponse.json", response);
    let resp:any = JSON.parse(response);
    //console.log("balance: "+resp.Response[0].MonetaryAccountBank.balance.value);
}).catch(function(error:string){
    console.log(error);
    expect(true).toBeFalsy();
});
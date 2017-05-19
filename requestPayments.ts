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


bunqApi.requestPayments(deviceServerConfig.userId, deviceServerConfig.accountId).then((response:string)=>{
    console.log(response);
    fs.writeFileSync(config.json.secretsPath+"/requestPaymentsResponse.json", response);
    let resp:any = JSON.parse(response);
    for(let r of resp.Response)  {
        console.log(r.Payment.created
            +" "+r.Payment.amount.value+"EUR"
            +" <"+r.Payment.counterparty_alias.display_name+">"
            +" "+r.Payment.counterparty_alias.iban
            +" <"+r.Payment.description.replace("\n","")+">");
    }
}).catch(function(error:string){
    console.log("error : "+error);
});
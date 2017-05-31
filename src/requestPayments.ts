import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";
import {BunqApi} from "./BunqApi";
import fs = require('fs');

const config:BunqApiConfig = new BunqApiConfig();
const bunqSecrets = BunqApiConfig.readJson(config.json.secretsFile);
const privateKeyPem:string=BunqApiConfig.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const connect:BunqConnection = new BunqConnection();
const setup:BunqApiSetup=new BunqApiSetup(connect,key,bunqSecrets.secret,installationToken);
const bunqApi:BunqApi=new BunqApi(connect, key,bunqSecrets.secret,setup,
    config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);

bunqApi.setPubBunqKeyPem(installationTokenConfig.Response[2].ServerPublicKey.server_public_key);

bunqApi.requestPayments(bunqSecrets.userId, bunqSecrets.accountId).then((response:string)=>{
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
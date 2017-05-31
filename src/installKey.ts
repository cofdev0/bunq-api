import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import fs = require('fs');
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";

const dateTime = require('node-datetime');
const dt = dateTime.create();
const dateTimeString = dt.format('YmdHMS');

const config:BunqApiConfig = new BunqApiConfig();
const key:BunqKey = BunqKey.createFromPrivateKeyFile(config.json.privateKeyFile);
const setup:BunqApiSetup=new BunqApiSetup(new BunqConnection(),key,"","");

setup.installKey().then(function(response:string){
    console.log(response);
    fs.writeFileSync(config.json.secretsPath+"/bunqInstallationToken"+dateTimeString+".json", response);
    let resp : any = JSON.parse(response);
    console.log("installation token: "+resp.Response[1].Token.token);
    console.log("Bunq server public key: "+resp.Response[1].server_public_key);



    console.log("please change bunqInstallationToken file name and set it in installationTokenFile in bunq.json");
}).catch(function(error:string){
    console.log("error : "+error);
});

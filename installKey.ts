import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import fs = require('fs');
import {BunqConnection} from "./BunqConnection";

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateTimeString = dt.format('YmdHMS');

const config:BunqApiConfig = new BunqApiConfig();
const publicKeyPem:string=config.read(config.json.publicKeyFile);
const setup:BunqApiSetup=new BunqApiSetup(new BunqConnection());

setup.installKey(publicKeyPem).then(function(response:string){
    console.log(response);
    fs.writeFileSync("../keys/bunqInstallationToken"+dateTimeString+".json", response);
    let resp : any = JSON.parse(response);
    console.log("installation token: "+resp[0].Token.token);
    console.log("Bunq server public key: "+resp[0].server_public_key);



    console.log("please change bunqInstallationToken file name and set it in installationTokenFile in bunq.json");
}).catch(function(error:string){
    console.log("error : "+error);
});

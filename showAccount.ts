
import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnection} from "./BunqConnection";
import {BunqKey} from "./BunqKey";
import {BunqApi} from "./BunqApi";
import fs = require('fs');

const keysPath = "../keys";
const config:BunqApiConfig = new BunqApiConfig();
const deviceServerConfig = BunqApiConfig.readJson(config.json.deviceServerConfigFile);
const privateKeyPem:string=BunqApiConfig.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const connect:BunqConnection = new BunqConnection();
const setup:BunqApiSetup=new BunqApiSetup(connect,key,deviceServerConfig.secret,installationToken);
const bunqApi:BunqApi=new BunqApi(connect, key,deviceServerConfig.secret,setup,keysPath);


bunqApi.requestMonetaryAccountBank(deviceServerConfig.userId, deviceServerConfig.accountId).then((response:string)=>{
    console.log(response);
    fs.writeFileSync(keysPath+"/requestMABResponse.json", response);
    let resp:any = JSON.parse(response);
    console.log("balance: "+resp.Response[0].MonetaryAccountBank.balance.value);
}).catch(function(error:string){
    console.log(error);
    expect(true).toBeFalsy();
});

// bunq.initSession().then(function() {
//     bunq.getUser().then(function(respGetUser:string) {
//         userId = bunq.parseResponse(respGetUser)[0]["UserPerson"]["id"];
//         console.log(respGetUser);
//         bunq.getMonetaryAccount(userId).then(function(respMonAcc:string) {
//             let firstAccount = bunq.parseResponse(respMonAcc)[0]["MonetaryAccountBank"];
//             console.log(firstAccount.balance.value + firstAccount.balance.currency);
//             console.log("Account:"+respMonAcc)
//             bunq.getTransactions(userId, firstAccount.id).then(function(respTransactions:string) {
//                 console.log("TX: "+respTransactions);
//                 let respJson = JSON.parse(respTransactions);
//                 let paymentsArray = {payments: respJson.Response};
//                 let paymentsJson = JSON.stringify(paymentsArray);
//                 fs.writeFileSync("payments.json", paymentsJson);
//             }).catch(function(error:string) {
//                 console.log(error);
//             });
//         }).catch(function(error:string) {
//             console.log(error);
//         });
//     }).catch(function(error:string) {
//         console.log(error);
//     });
//
// }).catch(function(error:string) {
//     console.log(error);
// });
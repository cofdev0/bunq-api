import {BunqApi} from "./BunqApi";
//const Bunq = require("./bunq");

const fs = require('fs');
// npm install file-system --save

const keyfilename = "./keys/hhpriv.pem";
const buffer = fs.readFileSync(keyfilename);
const privateKey = buffer.toString();
// https://together.bunq.com/topic/api-client-public-key-invalid

const INSTALLATION_TOKEN = "237049da3b2da8384adfe8a2aeec15788a79c3e20d62bc9602776c6090a5f194";
const API_TOKEN = "532d21224ca78416e25832252c90bddd1bc60a02fb3b99a8a85a8883b2370e23";

let bunq = new BunqApi( API_TOKEN, privateKey, INSTALLATION_TOKEN);
let userId : string;

bunq.initSession().then(function() {
    bunq.getUser().then(function(respGetUser:string) {
        userId = bunq.parseResponse(respGetUser)[0]["UserPerson"]["id"];
        console.log(respGetUser);
        bunq.getMonetaryAccount(userId).then(function(respMonAcc:string) {
            let firstAccount = bunq.parseResponse(respMonAcc)[0]["MonetaryAccountBank"];
            console.log(firstAccount.balance.value + firstAccount.balance.currency);
            console.log("Account:"+respMonAcc)
            bunq.getTransactions(userId, firstAccount.id).then(function(respTransactions:string) {
                console.log("TX: "+respTransactions);
                let respJson = JSON.parse(respTransactions);
                let paymentsArray = {payments: respJson.Response};
                let paymentsJson = JSON.stringify(paymentsArray);
                fs.writeFileSync("payments.json", paymentsJson);
            }).catch(function(error:string) {
                console.log(error);
            });
        }).catch(function(error:string) {
            console.log(error);
        });
    }).catch(function(error:string) {
        console.log(error);
    });

}).catch(function(error:string) {
    console.log(error);
});
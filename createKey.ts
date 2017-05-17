

const fs = require('file-system');
import {BunqKey} from "./BunqKey";

const dateTime = require('node-datetime');
var dt = dateTime.create();
var dateTimeString = dt.format('YmdHMS');

const keyFilePath = '../keys';
fs.mkdir(keyFilePath);

let bunqKey:BunqKey = BunqKey.createNew();
let publicPem = bunqKey.toPublicKeyString();
let publicKeyName : string = keyFilePath + "/publicKey"+dateTimeString+".pem";
fs.writeFileSync(publicKeyName, publicPem);
console.log("created public key "+publicKeyName);

let privatePem = bunqKey.toPrivateKeyString();
let privateKeyName : string = keyFilePath+"/privateKey"+dateTimeString+".pem";
fs.writeFileSync(privateKeyName, privatePem);
console.log("created private key "+privateKeyName);

console.log("to install your new key with Bunq rename key files and update publicKeyFile and privateKeyFile in bunq.json")
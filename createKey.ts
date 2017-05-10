
const dateTime = require('node-datetime');
const fs = require('file-system');
import {BunqKey} from "./BunqKey";


var dt = dateTime.create();
var dateTimeString = dt.format('YmdHMS');

const keyFilePath = '../keys';
fs.mkdir(keyFilePath);

let bunqKey = new BunqKey();
let publicPem = bunqKey.toPublicKeyString();
fs.writeFileSync(keyFilePath + "/publicKey"+dateTimeString+".pem", publicPem);

let privatePem = bunqKey.toPrivateKeyString();
fs.writeFileSync(keyFilePath+"/privateKey"+dateTimeString+".pem", privatePem);

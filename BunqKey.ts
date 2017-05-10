import  NodeRSA = require('node-rsa');


export class BunqKey {

    constructor() {
        this.key = new NodeRSA({
            b: 2048,
            encryptionScheme: 'pkcs1',
            signingScheme: 'pkcs1-sha256'
        });
    }

    toPublicKeyString() : string {
        return this.key.exportKey('pkcs8-public-pem');
    }

    toPrivateKeyString() : String {
        return this.key.exportKey('pkcs8-private-pem');
    }

    readonly key : NodeRSA;
};
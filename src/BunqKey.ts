const  NodeRSA = require('node-rsa');
import fs = require('fs-extra');

export class BunqKey {

    constructor(privateKeyPem:string) {
        this.key = new NodeRSA(privateKeyPem, {signingScheme: 'pkcs1-sha256', env: 'node'});
    }

    static createNew():BunqKey {
        /* istanbul ignore next */
        {
            let aKey: any = new NodeRSA({
                b: 2048,
                encryptionScheme: 'pkcs1',
                signingScheme: 'pkcs1-sha256'
            });
            let privateKeyString = aKey.exportKey('pkcs8-private-pem');
            return new this(privateKeyString);
        }
    }

    static createFromPrivateKeyFile(pemFilename:string) {
        const buffer = fs.readFileSync(pemFilename);
        return new this(buffer.toString());
    }

    toPublicKeyString() : string {
        return this.key.exportKey('pkcs8-public-pem');
    }

    toPrivateKeyString() : string {
        return this.key.exportKey('pkcs8-private-pem');
    }

    signApiCall(options:any):any {
        let stringToSign = this.createStringToSign(options);
        //console.log("signApiCall:"+stringToSign);
        //let key = new NodeRSA(this.privateKey, {signingScheme: 'pkcs1-sha256', env: 'node'});
        return this.key.sign(stringToSign,'base64','utf8');

        // const sign = crypto.createSign('sha256');
        // sign.update(stringToSign);
        // return sign.sign({
        //   key: this.privateKey,
        //   passphrase: ""
        // }, "base64");
    }

    verifySigWithPubkey(options):boolean {
        let pubKey = new NodeRSA();
        pubKey.importKey(this.toPublicKeyString(),'public');
        let optionsSig = options.headers['X-Bunq-Client-Signature'];
        delete options.headers['X-Bunq-Client-Signature'];
        let stringToSign = this.createStringToSign(options);
        options.headers['X-Bunq-Client-Signature']=optionsSig;
        //console.log("verify:"+stringToSign);
        return pubKey.verify(stringToSign, optionsSig,'utf8','base64');
    }

    createStringToSign(options:any) : string {
        let stringToSign:string = options.method + " ";
        // let endPoint:string = options.uri;
        //if(options.uri.indexOf("bunq.com") != -1)
        // endPoint = (options.uri.split("bunq.com"))[1];
        stringToSign += (options.uri.split("bunq.com"))[1];
        stringToSign += "\n";

        // We need to order the headers
        const orderedHeaders = BunqKey.orderKeys(options.headers);
        Object.keys(orderedHeaders).forEach(function(key) {
            //if (key.startsWith("X-Bunq-") || key == "Cache-Control" || key == "User-Agent")
                stringToSign += key + ": " + orderedHeaders[key] + "\n";
        });
        stringToSign += "\n";
        if (options.body) {
            stringToSign += options.body.toString();
        }
        return stringToSign;
    }

    // credit to http://stackoverflow.com/questions/9658690/is-there-a-way-to-sort-order-keys-in-javascript-objects
    private static orderKeys(obj:any):any {

        const keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
            if (k1 < k2) return -1;
            else return +1;

        });

        const after:any = {};
        for (let i = 0; i < keys.length; i++) {
            after[keys[i]] = obj[keys[i]];
            delete obj[keys[i]];
        }

        for (let i = 0; i < keys.length; i++) {
            obj[keys[i]] = after[keys[i]];
        }
        return obj;
    }


    readonly key : any;
}
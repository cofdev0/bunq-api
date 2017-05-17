const rp = require('request-promise');
const randomstring = require("randomstring");
const NodeRSA = require('node-rsa');


//const BUNQ_API_SERVICE_URL = 'https://sandbox.public.api.bunq.com';
const BUNQ_API_SERVICE_URL = 'https://api.bunq.com';
const BUNQ_API_VERSION = 'v1';

export class BunqApi {

    constructor(apiKey:string, privateKey:string, installationToken:string) {
        this.installationToken = installationToken;
        this.apiKey = apiKey;
        this.privateKey = privateKey;
    }


    postDeviceServer(description:string, permittedIps:string[]):any {
        return this.generateRequest("POST", "/device-server", {
            secret: this.apiKey,
            description: description,
            permitted_ips: permittedIps
        });
    }

    getDeviceServers():any {
        return this.generateRequest("GET", "/device-server",{});
    }

    postSessionServer():any {
        return this.generateRequest("POST", "/session-server", {
            secret: this.apiKey
        });
    }

    getUser(userId:string=undefined):any {
        const urlWithParameter = userId ? `/user/${userId}` : "/user";
        return this.generateRequest("GET", urlWithParameter,{});
    }

    getMonetaryAccount(userId:string, accountId:string=undefined):any {
        const urlWithParameter = accountId ? `/user/${userId}/monetary-account/${accountId}` : `/user/${userId}/monetary-account`;
        return this.generateRequest("GET", urlWithParameter,{});
    }

    getTransactions(userId:string, accountId:string):any {
        const urlWithParameter = `/user/${userId}/monetary-account/${accountId}/payment`;
        return this.generateRequest("GET", urlWithParameter,{});
    }

    sendPayment(userId:string, accountId:string, value:string,
                iban:string, name:string, description:string):any {
        const urlWithParameter = `/user/${userId}/monetary-account/${accountId}/payment`;
        return this.generateRequest("POST",urlWithParameter, {
            "amount": {
                "value": value,
                "currency": "EUR"
            },
            "counterparty_alias": {
                "type": "IBAN",
                "value": iban,
                "name": name
            },
            "description": description
        });
    }

    initSession():Promise<any> {
        // to create a session we need to provide the installation token, afterwards the session token
        this.sessionToken = this.installationToken;
        return new Promise((resolve, reject) => {
            this.postSessionServer().then((response:any) => {
                this.sessionToken = JSON.parse(response).Response[1]["Token"]["token"]
                resolve();
            }).catch((error:any) => {
                reject(error);
            })
        })
    }

    setSessionToken(sessionToken:string) {
        this.sessionToken = sessionToken;
    }

    generateRequest(method:string, url:string, body:any):any {
        let options = this.getDefaultOptions();
        options.uri = "/" + BUNQ_API_VERSION + url;

        if (body && method != "GET") {
            options.body = JSON.stringify(body);
        }
        options.method = method;
        options.headers['X-Bunq-Client-Signature'] = this.signApiCall(options);
        options.uri = BUNQ_API_SERVICE_URL + options.uri;

        return rp(options);
    }

    getDefaultOptions():any {
        return {
            uri: BUNQ_API_SERVICE_URL,
            headers: {
                'Cache-Control': 'no-cache',
                'User-Agent': 'bunq-TestSerdver/1.00 sandbox/0.17b',
                'X-Bunq-Language': 'en_US',
                'X-Bunq-Region': 'en_US',
                'X-Bunq-Geolocation': '0 0 0 00 NL',
                'X-Bunq-Client-Request-Id': randomstring.generate(7),
                'X-Bunq-Client-Authentication': this.sessionToken,
            }
        };
    }

    signApiCall(options:any):any {
        let stringToSign = options.method + " ";
        stringToSign += options.uri;
        stringToSign += "\n";

        // We need to order the headers
        const orderedHeaders = this.orderKeys(options.headers);
        Object.keys(orderedHeaders).forEach(function(key) {
            if (key.startsWith("X-Bunq-") || key == "Cache-Control" || key == "User-Agent")
                stringToSign += key + ": " + orderedHeaders[key] + "\n";
        });
        stringToSign += "\n";
        if (options.body) {
            stringToSign += options.body.toString();
        }

        let key = new NodeRSA(this.privateKey, {signingScheme: 'pkcs1-sha256', env: 'node'});
        return key.sign(stringToSign,'base64','utf8');

        // const sign = crypto.createSign('sha256');
        // sign.update(stringToSign);
        // return sign.sign({
        //   key: this.privateKey,
        //   passphrase: ""
        // }, "base64");
    }

    // credit to http://stackoverflow.com/questions/9658690/is-there-a-way-to-sort-order-keys-in-javascript-objects
    orderKeys(obj:any):any {

        var keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
            if (k1 < k2) return -1;
            else if (k1 > k2) return +1;
            else return 0;
        });

        var after:any = {};
        for (let i = 0; i < keys.length; i++) {
            after[keys[i]] = obj[keys[i]];
            delete obj[keys[i]];
        }

        for (let i = 0; i < keys.length; i++) {
            obj[keys[i]] = after[keys[i]];
        }
        return obj;
    }

    parseResponse(response:any):any {
        return JSON.parse(response)["Response"];
    }

    installationToken:string;
    apiKey:string;
    privateKey:string;
    sessionToken:string;



}

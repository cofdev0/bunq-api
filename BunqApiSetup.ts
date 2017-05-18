import {BunqKey} from "./BunqKey";

import {BunqApiConfig} from "./BunqApiConfig";

import {BunqServerConnection} from "./BunqInterfaces";
const randomstring = require("randomstring");



const BUNQ_API_SERVICE_URL = 'https://api.bunq.com';
const BUNQ_API_VERSION = 'v1';

export class BunqApiSetup {

    constructor(aConnection:BunqServerConnection, aKey:BunqKey, aSecretApiKey:string, aInstallationToken?:string) {
        this.connection=aConnection;
        this.key=aKey;
        this.secretApiKey=aSecretApiKey;
        if(aInstallationToken) this.installationToken=aInstallationToken;
    }

    installKey() : Promise<any> {
        let options:any = this.createOptions("POST", "/installation", {
            client_public_key: this.key.toPublicKeyString()
        });
        return this.connection.request(options);
    }

    createDeviceServer(description:string) : Promise<any> {
        let options:any = this.createOptions("POST", "/device-server", {
            'description':description,
            'secret':this.secretApiKey
        });
        options.headers['X-Bunq-Client-Authentication'] = this.installationToken;
        options.headers['X-Bunq-Client-Signature'] = this.key.signApiCall(options);
        return this.connection.request(options);
    }


    createSessionServer() : Promise<any> {
        let options:any = this.createOptions("POST", "/session-server", {secret:this.secretApiKey});
        options.headers['X-Bunq-Client-Authentication'] = this.installationToken;
        options.headers['X-Bunq-Client-Signature'] = this.key.signApiCall(options);
        return this.connection.request(options);
    }

    private createOptions(method:string, endPoint:string, body:any) : any {
        let options = this.createDefaultOptions();
        options.uri = BUNQ_API_SERVICE_URL + "/" + BUNQ_API_VERSION + endPoint;
        options.body = JSON.stringify(body);
        options.method = method;
        return options;
    }

    private createDefaultOptions():any {
        return {
            uri: BUNQ_API_SERVICE_URL,
            headers: {
                'Cache-Control': 'no-cache',
                'User-Agent': 'bunq-TestServer/1.00',
                'X-Bunq-Language': 'en_US',
                'X-Bunq-Region': 'en_US',
                'X-Bunq-Geolocation': '0 0 0 00 NL',
                'X-Bunq-Client-Request-Id': randomstring.generate(7),

            }
        };
    }
    private connection : BunqServerConnection;
    private key:BunqKey;
    private secretApiKey:string;
    private installationToken:string


}
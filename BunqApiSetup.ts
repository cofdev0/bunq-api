import {BunqKey} from "./BunqKey";
import * as fs from "fs-extra";
import {BunqApiConfig} from "./BunqApiConfig";
import * as moment from 'moment';
const randomstring = require("randomstring");

interface BunqServerConnection {
    request(options:any):Promise<any>;
}

const BUNQ_API_SERVICE_URL = 'https://api.bunq.com';
const BUNQ_API_VERSION = 'v1';

export class BunqApiSetup {

    constructor(aConnection:BunqServerConnection) {
        this.connection=aConnection;
    }

    installKey(pubKeyPem : string) : Promise<any> {
        let options:any = this.createOptions("POST", "/installation", {
            client_public_key: pubKeyPem
        });
        return this.connection.request(options);
    }

    createDeviceServer(key:BunqKey, deviceServerConfig:any, installationToken) : Promise<any> {
        let options:any = this.createOptions("POST", "/device-server", deviceServerConfig);
        options.headers['X-Bunq-Client-Authentication'] = installationToken;
        options.headers['X-Bunq-Client-Signature'] = key.signApiCall(options);
        return this.connection.request(options);
    }

    updateSession(sessionPath:string, key:BunqKey, secretApiKey:string, installationToken) : Promise<any> {
        const sessionArchivePath = sessionPath+"/sessions";
        return new Promise((resolve, reject) => {
            const sessionFilename:string = sessionPath + "/bunqSession.json";
            if(fs.existsSync(sessionFilename)) {
                const config: BunqApiConfig = new BunqApiConfig();
                const sessionResponseJson: any = config.readJson(sessionFilename);
                const token: string = sessionResponseJson.Response[1].Token.token;
                const createString: string = sessionResponseJson.Response[1].Token.created;
                const created = moment(createString);
                const now = moment();
                const nextUpdate = created.add(1, "days");
                if (nextUpdate.isAfter(now)) {
                    resolve(token);
                    return;
                }
            }
            this.createSessionServer(key, secretApiKey, installationToken).then(function (response) {
                const now = moment();
                //console.log(response);
                let respJson:any=JSON.parse(response);
                respJson.Response[1].Token.created=now.format("YYYY-MM-DD HH:mm:ss");
                fs.writeFileSync(sessionFilename, JSON.stringify(respJson));
                fs.ensureDirSync(sessionArchivePath);
                fs.writeFileSync(sessionArchivePath + "/bunqSession_" + now.format("YYYYMMDDHHmmss") + ".json", response);
                const sessionResponseJson: any = JSON.parse(response);
                const token: string = sessionResponseJson.Response[1].Token.token;
                resolve(token);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    createSessionServer(key:BunqKey, secretApiKey:string, installationToken) : Promise<any> {
        let options:any = this.createOptions("POST", "/session-server", {secret:secretApiKey});
        options.headers['X-Bunq-Client-Authentication'] = installationToken;
        options.headers['X-Bunq-Client-Signature'] = key.signApiCall(options);
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
}
import {BunqKey} from "./BunqKey";
import {BunqServerConnection, SessionCreator} from "./BunqInterfaces";
import * as moment from 'moment';
import {BunqApiConfig} from "./BunqApiConfig";
import * as fs from "fs-extra";
const randomstring = require("randomstring");

//const BUNQ_API_SERVICE_URL = 'https://sandbox.public.api.bunq.com';
const BUNQ_API_SERVICE_URL = 'https://api.bunq.com';
const BUNQ_API_VERSION = 'v1';

export class BunqApi {

    constructor(aConnection:BunqServerConnection, privateKey:BunqKey, aSecretApiKey:string,
                aSessionCreator:SessionCreator, aSessionFilename:string, aSessionHistoryPath:string) {
        this.privateKey = privateKey;
        this.apiKey = aSecretApiKey;
        this.sessionCreator = aSessionCreator;
        this.connection=aConnection;
        this.sessionFilename=aSessionFilename;
        this.sessionHistoryPath=aSessionHistoryPath;
        this.sessionToken="";
    }

    updateSession() : Promise<any> {

        if(!fs.existsSync(this.sessionFilename)) {
            return this.requestAndStoreSessionToken();
        }

        const sessionResponseJson: any = BunqApiConfig.readJson(this.sessionFilename);
        const token: string = sessionResponseJson.Response[1].Token.token;
        const createString: string = sessionResponseJson.Response[1].Token.created;
        const created = moment(createString);
        const now = moment();
        const nextUpdate = created.add(1, "days");

        if(nextUpdate.isAfter(now)) {
            this.sessionToken=token;
            return Promise.resolve(token);
            //return;
        }

        return this.requestAndStoreSessionToken();



    }

    requestAndStoreSessionToken():Promise<any> {
        return this.sessionCreator.createSessionServer().then((response) => {
            const now = moment();
            //console.log(response);
            let respJson:any=JSON.parse(response);
            respJson.Response[1].Token.created=now.format("YYYY-MM-DD HH:mm:ss");
            fs.writeFileSync(this.sessionFilename, JSON.stringify(respJson));
            fs.ensureDirSync(this.sessionHistoryPath);
            fs.writeFileSync(this.sessionHistoryPath + "/bunqSession_" + now.format("YYYYMMDDHHmmss") + ".json", response);
            const sessionResponseJson: any = JSON.parse(response);
            const token: string = sessionResponseJson.Response[1].Token.token;
            this.sessionToken=token;
            return Promise.resolve(token);
        }).catch(function (error) {
            return Promise.reject(error);
        });
    }

    getSessionToken():string {
        return this.sessionToken;
    }

    requestUser() : Promise<any> {
        return this.updateSession().then(()=>{
            let options:any = this.createOptions("GET", "/user");
            return this.connection.request(options);
        });
    }

    requestSomething() : Promise<any> {
        return this.updateSession().then(()=>{
            let options:any = this.createOptions("GET", "/something");
            return this.connection.request(options);
        });
    }

    requestMonetaryAccountBank(userId:string, accountId?:string) : Promise<any> {
        return this.updateSession().then(()=>{
            let accountIdString:string = accountId ? "/"+accountId : "";
            let options:any = this.createOptions("GET", "/user/"+userId+"/monetary-account-bank"+accountIdString);
            return this.connection.request(options);
        });
    }

    requestPayments(userId:string, accountId:string) : Promise<any> {
        return this.updateSession().then(()=>{
            let options:any = this.createOptions("GET", "/user/"+userId+"/monetary-account/"+accountId+"/payment");
            return this.connection.request(options);
        });
    }

    sendPayment(userId:string, accountId:string, value:string, iban:string, name:string, description:string) : Promise<any> {
        return this.updateSession().then(()=>{
            let options:any = this.createOptions("POST", "/user/"+userId+"/monetary-account/"+accountId+"/payment",
                {
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
            return this.connection.request(options);
        });
    }

    installNotificationFilter(userId:string, accountId:string, url:string) {
        return this.updateSession().then(()=>{
            let options:any = this.createOptions("PUT", "/user/"+userId+"/monetary-account-bank/"+accountId,
                { "notification_filters":[
                    {
                        "notification_delivery_method" : "URL",
                        "notification_target": url,
                        "category": "PAYMENT"
                    }
                ]
                });
            //console.log("string rp :"+JSON.stringify(options));
            //todo: check if slashes are escaped before sending
            return this.connection.request(options);
        });

    }

    private createOptions(method:string, endPoint:string, body?:any) : any {
        let options = BunqApi.createDefaultOptions();
        options.uri = BUNQ_API_SERVICE_URL + "/" + BUNQ_API_VERSION + endPoint;
        if (body && method != "GET") {
            options.body = JSON.stringify(body);
            //console.log("body:"+options.body);
            //options.json = true;
        }
        options.method = method;
        options.headers['X-Bunq-Client-Authentication'] = this.sessionToken;
        options.headers['X-Bunq-Client-Signature'] = this.privateKey.signApiCall(options);

        return options;
    }

    private static createDefaultOptions():any {
        return {
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


    private sessionCreator:SessionCreator;
    private connection:BunqServerConnection;
    private apiKey:string;
    private privateKey:BunqKey;
    private sessionToken:string;
    private sessionFilename:string;
    private sessionHistoryPath:string;



}

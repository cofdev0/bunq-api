
import {BunqKey} from "./BunqKey";
import {BunqApiConfig} from "./BunqApiConfig";
const rp = require('request-promise');




export class BunqConnectionMock {


    constructor() {
        this.config = BunqApiConfig.createForSpecs();
        this.serverKey = BunqKey.createFromPrivateKeyFile("./testData/privateBunqKey.pem");
    }

    request(options:any) : Promise<any> {
        if(options.uri.indexOf("installation")!==-1) return this.requestInstallation();
        else if(!this.verifyRequestSignature(options)) return Promise.reject("signature wrong");
        //else if(!this.verifyRequestSignature(options)) return new Promise((resolve, reject)=>{reject("signature wrong");});
        else {
            if(options.uri.indexOf("device-server")!==-1) return this.requestDeviceServer();
            else if(options.uri.indexOf("session-server")!==-1) return this.requestSessionServer(options);
            else if((options.uri.indexOf("payment")!==-1)
                &&(options.method=="POST")) return this.sendPayment();
            else if(options.uri.indexOf("payment")!==-1) return this.requestPayments();
            else if((options.method=="PUT")&&(options.uri.indexOf("monetary-account-bank")!==-1))
                return this.installNotificationFilter();
            else if(options.uri.indexOf("monetary-account-bank")!==-1) return this.requestMoneytaryAccountBank();
            else if(options.uri.indexOf("user")!==-1) return this.requestUser();
            else

            return Promise.reject("unknown endPoint");
        }
    }

    requestInstallation(): Promise<any> {
        let installationResponse:string = BunqApiConfig.read(this.config.json.secretsPath+"/installationResponse.json");
        return Promise.resolve(installationResponse);
    }

    requestDeviceServer(): Promise<any> {
        let response:any = {"Response":[{"Id":{"id":601830}}]};
        return BunqConnectionMock.signAndResolve(response);
    }

    requestSessionServer(options:any) : Promise<any> {
        if(!this.verifyInstallationToken((options))) return Promise.reject("installation token wrong");
        const response:any=BunqApiConfig.readJson(this.config.json.secretsPath+"/bunqSessionServerOriginal.json");
        return BunqConnectionMock.signAndResolve(response);
    }

    requestUser(): Promise<any> {
        const response:any=BunqApiConfig.readJson(this.config.json.secretsPath+"/requestUserResponse.json");
        return BunqConnectionMock.signAndResolve(response);
    }

    requestMoneytaryAccountBank(): Promise<any> {
        const response:any=BunqApiConfig.readJson(this.config.json.secretsPath+"/requestMABResponse.json");
        return BunqConnectionMock.signAndResolve(response);
    }

    requestPayments(): Promise<any> {
        const response:any=BunqApiConfig.readJson(this.config.json.secretsPath+"/requestPaymentsResponse.json");
        return BunqConnectionMock.signAndResolve(response);
    }

    sendPayment(): Promise<any> {
        const response:any=BunqApiConfig.readJson(this.config.json.secretsPath+"/sendPaymentResponse.json");
        return BunqConnectionMock.signAndResolve(response);
    }

    installNotificationFilter(): Promise<any> {
        const response:any=BunqApiConfig.readJson(this.config.json.secretsPath+"/installFilterResponse.json");
        return BunqConnectionMock.signAndResolve(response);
    }

    private static signAndResolve(response:any):Promise<any>{
        return Promise.resolve(JSON.stringify(response));
    }

    private verifyRequestSignature(options:any):boolean {
        const privateKeyPem:string=BunqApiConfig.read(this.config.json.secretsPath+"/privateKey.pem");
        const key : BunqKey = new BunqKey(privateKeyPem);
        return key.verifySigWithPubkey(options);
    }

    private verifyInstallationToken(options:any):boolean {
        const installationTokenJson:any=BunqApiConfig.readJson(this.config.json.installationTokenFile);
        const instToken:string=installationTokenJson.Response[1].Token.token;
        const requestInstToken:string=options.headers['X-Bunq-Client-Authentication'];
        return (instToken==requestInstToken);

    }

    private config:BunqApiConfig;
    private serverKey : BunqKey;

}

export class BunqConnection {
    constructor() {
   }

    /* jshint ignore:start*/
    request(options:any) : Promise<any> {


        /* istanbul ignore next */
        console.log("options:"+JSON.stringify(options));
        //options.resolveWithFullResponse= true;
        /* istanbul ignore next */
        return rp(options);
    }
    /* jshint ignore:end*/


}
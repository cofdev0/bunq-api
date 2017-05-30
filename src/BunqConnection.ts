
import {BunqKey} from "./BunqKey";
import {BunqApiConfig} from "./BunqApiConfig";
const rp = require('request-promise');

const config:BunqApiConfig = BunqApiConfig.createForSpecs();

export class BunqConnectionMock {



    constructor() {
    }

    request(options:any) : Promise<any> {
        if(options.uri.indexOf("installation")!==-1) return this.requestInstallation(options);
        else if(!this.verifyRequestSignature(options)) return Promise.reject("signature wrong");
        //else if(!this.verifyRequestSignature(options)) return new Promise((resolve, reject)=>{reject("signature wrong");});
        else {
            if(options.uri.indexOf("device-server")!==-1) return this.requestDeviceServer(options);
            else if(options.uri.indexOf("session-server")!==-1) return this.requestSessionServer(options);
            else if((options.uri.indexOf("payment")!==-1)
                &&(options.method=="POST")) return this.sendPayment(options);
            else if(options.uri.indexOf("payment")!==-1) return this.requestPayments(options);
            else if((options.method=="PUT")&&(options.uri.indexOf("monetary-account-bank")!==-1))
                return this.installNotificationFilter(options);
            else if(options.uri.indexOf("monetary-account-bank")!==-1) return this.requestMoneytaryAccountBank(options);
            else if(options.uri.indexOf("user")!==-1) return this.requestUser(options);
            else

            return Promise.reject("unknown endPoint");
        }


    }

    requestInstallation(options:any) : Promise<any> {
        let installationResponse:string = BunqApiConfig.read(config.json.secretsPath+"/installationResponse.json");
        return Promise.resolve(installationResponse);
    }

    requestDeviceServer(options:any) : Promise<any> {
        let okResult = {"Response":[{"Id":{"id":601830}}]};
        return Promise.resolve(JSON.stringify(okResult));
    }

    requestSessionServer(options:any) : Promise<any> {
        if(!this.verifyInstallationToken((options))) return Promise.reject("installation token wrong");
        const response:string=BunqApiConfig.readJson(config.json.secretsPath+"/bunqSessionServerOriginal.json");
        return Promise.resolve(JSON.stringify(response));
    }

    requestUser(options:any) : Promise<any> {
        const response:string=BunqApiConfig.readJson(config.json.secretsPath+"/requestUserResponse.json");
        return Promise.resolve(JSON.stringify(response));
    }

    requestMoneytaryAccountBank(options:any) : Promise<any> {
        const response:string=BunqApiConfig.readJson(config.json.secretsPath+"/requestMABResponse.json");
        return Promise.resolve(JSON.stringify(response));
    }

    requestPayments(options:any) : Promise<any> {
        const response:string=BunqApiConfig.readJson(config.json.secretsPath+"/requestPaymentsResponse.json");
        return Promise.resolve(JSON.stringify(response));
    }

    sendPayment(options:any) : Promise<any> {
        const response:string=BunqApiConfig.readJson(config.json.secretsPath+"/sendPaymentResponse.json");
        return Promise.resolve(JSON.stringify(response));
    }

    installNotificationFilter(options:any) : Promise<any> {
        const response:string=BunqApiConfig.readJson(config.json.secretsPath+"/installFilterResponse.json");
        return Promise.resolve(JSON.stringify(response));
    }

    private verifyRequestSignature(options:any):boolean {
        const privateKeyPem:string=BunqApiConfig.read(config.json.secretsPath+"/privateKey.pem");
        const key : BunqKey = new BunqKey(privateKeyPem);
        return key.verifySigWithPubkey(options);
    }

    private verifyInstallationToken(options:any):boolean {
        const installationTokenJson:any=BunqApiConfig.readJson(config.json.installationTokenFile);
        const instToken:string=installationTokenJson.Response[1].Token.token;
        const requestInstToken:string=options.headers['X-Bunq-Client-Authentication'];
        return (instToken==requestInstToken);

    }


}

export class BunqConnection {
    constructor() {
    }

    request(options:any) : Promise<any> {
        //todo: verify response with bunq public key
        /* istanbul ignore next */
        options.resolveWithFullResponse= true;
        /* istanbul ignore next */
        return rp(options);
    }

}
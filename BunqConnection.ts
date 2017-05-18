
import {BunqKey} from "./BunqKey";
import {BunqApiConfig} from "./BunqApiConfig";
const rp = require('request-promise');

const testDataPath:string = "./testData";

export class BunqConnectionMock {



    constructor() {
    }

    request(options:any) : Promise<any> {
        if(options.uri.indexOf("installation")!==-1) return this.requestInstallation(options);
        if(options.uri.indexOf("device-server")!==-1) return this.requestDeviceServer(options);
        if(options.uri.indexOf("session-server")!==-1) return this.requestSessionServer(options);
        if((options.uri.indexOf("payment")!==-1)
            &&(options.method=="POST")) return this.sendPayment(options);
        if(options.uri.indexOf("payment")!==-1) return this.requestPayments(options);
        if(options.uri.indexOf("monetary-account-bank")!==-1) return this.requestMoneytaryAccountBank(options);
        if(options.uri.indexOf("user")!==-1) return this.requestUser(options);

        // return new Promise((resolve, reject) => {
        //     reject("unknown endPoint!")
        // });
    }

    requestInstallation(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            let installationResponse:string = BunqApiConfig.read(testDataPath+"/installationResponse.json");
            resolve(installationResponse);
        });
    }

    requestDeviceServer(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            // const config:BunqApiConfig = new BunqApiConfig();
            // const privateKeyPem:string=config.read("./testData/privateKey.pem");
            // const key : BunqKey = new BunqKey(privateKeyPem);
            // if(!key.verifySigWithPubkey(options)) return reject("signature wrong");
            let okResult = {"Response":[{"Id":{"id":601830}}]};
            resolve(JSON.stringify(okResult));
        });
    }

    requestSessionServer(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            // todo: verify installation key
            const response:string=BunqApiConfig.readJson(testDataPath+"/bunqSessionServerOriginal.json");
            resolve(JSON.stringify(response));
        });
    }

    requestUser(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            const response:string=BunqApiConfig.readJson(testDataPath+"/requestUserResponse.json");
            resolve(JSON.stringify(response));
        });
    }

    requestMoneytaryAccountBank(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            const response:string=BunqApiConfig.readJson(testDataPath+"/requestMABResponse.json");
            resolve(JSON.stringify(response));
        });
    }

    requestPayments(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            const response:string=BunqApiConfig.readJson(testDataPath+"/requestPaymentsResponse.json");
            resolve(JSON.stringify(response));
        });
    }

    sendPayment(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            const response:string=BunqApiConfig.readJson(testDataPath+"/sendPaymentResponse.json");
            resolve(JSON.stringify(response));
        });
    }

    private verifyRequestSignature(options:any):boolean {
        const privateKeyPem:string=BunqApiConfig.read(testDataPath+"/privateKey.pem");
        const key : BunqKey = new BunqKey(privateKeyPem);
        return key.verifySigWithPubkey(options);
    }



}

export class BunqConnection {
    constructor() {
    }

    request(options:any) : Promise<any> {
        /* istanbul ignore next */
        return rp(options);
    }

}
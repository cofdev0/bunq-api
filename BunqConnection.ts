
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
            const sessionResponse:string=BunqApiConfig.readJson(testDataPath+"/bunqSessionServerOriginal.json");
            resolve(JSON.stringify(sessionResponse));
        });
    }

    requestUser(options:any) : Promise<any> {
        return new Promise((resolve, reject) => {
            if(!this.verifyRequestSignature(options)) return reject("signature wrong");
            const sessionResponse:string=BunqApiConfig.readJson(testDataPath+"/requestUserResponse.json");
            resolve(JSON.stringify(sessionResponse));
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
import {} from 'jest';
import {BunqKey} from "./BunqKey";
import {BunqApiSetup} from "./BunqApiSetup";
import fs = require('fs-extra');
import {BunqConnectionMock} from "./BunqConnection";
import {BunqApiConfig} from "./BunqApiConfig";


describe("BunqApiSetup", () => {

    let connect = new BunqConnectionMock();
    let setup : BunqApiSetup = new BunqApiSetup(connect);
    let key : BunqKey = BunqKey.createNew();
    let pubKeyPem = key.toPublicKeyString();

    const EXPECTED_INSTALLATION_TOKEN = "237049da3b2da8384adfe8a2aeec15788a79c3e20d62bc9602776c6090a5f194";

    it("can install a key with BunqConnectionMock", () => {
        setup.installKey(pubKeyPem).then(function(response:string){
            //console.log("ok:"+response);
            let resp : any = JSON.parse(response);
            expect(resp.Response[1].Token.token.indexOf(EXPECTED_INSTALLATION_TOKEN)).toBe(0);
        }).catch(function(error:string){
            console.log("error:"+error)
            expect(true).toBe(false);
        });
    });

    it("can setup device-server with BunqConnectionMock", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        const deviceServerConfig = config.readJson("./testData/bunqDeviceServerConfig.json");
        const privateKeyPem:string=config.read("./testData/privateKey.pem");
        const key : BunqKey = new BunqKey(privateKeyPem);
        const installationTokenConfig = config.readJson("./testData/bunqInstallationToken.json");
        const installationToken:string=installationTokenConfig.Response[1].Token.token;

        setup.createDeviceServer(key, deviceServerConfig, installationToken).then(function(response:string){
            //console.log("ok:"+response);
            let resp : any = JSON.parse(response);
            expect(resp.Response[0].Id.id).toBeGreaterThan(0);
        }).catch(function(error:string){
            console.log("error:"+error)
            expect(true).toBe(false);
        });
    });

    it("can not setup device-server with BunqConnectionMock given wrong key", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        const deviceServerConfig = config.readJson("./testData/bunqDeviceServerConfig.json");
        const wrongKey : BunqKey = BunqKey.createNew();
        const installationTokenConfig = config.readJson("./testData/bunqInstallationToken.json");
        const installationToken:string=installationTokenConfig.Response[1].Token.token;

        setup.createDeviceServer(wrongKey, deviceServerConfig, installationToken).then(function(response:string){
            console.log("wrong key results in acceptance. this is wrong!");
            expect(true).toBe(false);
        }).catch(function(error:string){
            //console.log("this error is expected: "+error)
        });
    });

    it("can setup session-server with BunqConnectionMock", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        const deviceServerConfig = config.readJson("./testData/bunqDeviceServerConfig.json");
        const privateKeyPem:string=config.read("./testData/privateKey.pem");
        const key : BunqKey = new BunqKey(privateKeyPem);
        const installationTokenConfig = config.readJson("./testData/bunqInstallationToken.json");
        const installationToken:string=installationTokenConfig.Response[1].Token.token;

        setup.createSessionServer(key, deviceServerConfig.secret, installationToken).then(function(response:string){
            //console.log("ok:"+response);
            let resp : any = JSON.parse(response);
            expect(resp.Response[1].Token.token.length).toBeGreaterThan(0);
        }).catch(function(error:string){
            console.log("error:"+error)
            expect(true).toBe(false);
        });
    });

    it("can not setup session-server with BunqConnectionMock given a wrong key", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        const deviceServerConfig = config.readJson("./testData/bunqDeviceServerConfig.json");
//        const privateKeyPem:string=config.read("./testData/privateKey.pem");
        const key : BunqKey = BunqKey.createNew();
        const installationTokenConfig = config.readJson("./testData/bunqInstallationToken.json");
        const installationToken:string=installationTokenConfig.Response[1].Token.token;

        setup.createSessionServer(key, deviceServerConfig.secret, installationToken).then(function(response:string){
            console.log("this is not expected:"+response);
            expect(true).toBeFalsy();
        }).catch(function(error:string){
            // console.log("expected error:"+error)
            expect(error).toEqual("signature wrong");
        });
    });

    it("can update an existing session token on disk by querying session server if needed", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        const deviceServerConfig = config.readJson(testDataPath+"/bunqDeviceServerConfig.json");
        const privateKeyPem:string=config.read("./testData/privateKey.pem");
        const key : BunqKey = new BunqKey(privateKeyPem);
        const installationTokenConfig = config.readJson(testDataPath+"/bunqInstallationToken.json");
        const installationToken:string=installationTokenConfig.Response[1].Token.token;
        if(fs.existsSync(sessionFilename)) {
            fs.unlinkSync(sessionFilename);
        }
        if(fs.existsSync(testDataSessionHistoryPath)) {
            fs.removeSync(testDataSessionHistoryPath);
        }

        setup.updateSession(testDataPath, key, deviceServerConfig.secret, installationToken).then(function(response:string){
            const token:string = response;
            //console.log("new token:"+token);
            expect(fs.exists(sessionFilename));
            setup.updateSession(testDataPath, key, deviceServerConfig.secret, installationToken).then(function(response:string) {
                const sameToken:string = response;
                //console.log("same token:"+sameToken);
                expect(token).toEqual(sameToken);
            }).catch(function(error:string){
                //console.log("error2:"+error)
                expect(true).toBeFalsy();
            });
        }).catch(function(error:string){
            console.log("error1:"+error)
            expect(true).toBeFalsy();
        });
    });

    it("can not update with wrong key", () => {
        const config:BunqApiConfig = new BunqApiConfig();
        const deviceServerConfig = config.readJson(testDataPath+"/bunqDeviceServerConfig.json");
        const wrongKey : BunqKey = BunqKey.createNew();
        const installationTokenConfig = config.readJson(testDataPath+"/bunqInstallationToken.json");
        const installationToken:string=installationTokenConfig.Response[1].Token.token;
        if(fs.existsSync(sessionFilename)) {
            fs.unlinkSync(sessionFilename);
        }
        if(fs.existsSync(testDataSessionHistoryPath)) {
            fs.removeSync(testDataSessionHistoryPath);
        }

        setup.updateSession(testDataPath, wrongKey, deviceServerConfig.secret, installationToken).then(function(response:string){
            console.log("error! we should not be here! "+response);
            expect(true).toBeFalsy();
        }).catch(function(error:string){
            console.log("expected error!")
        });
    });

    const testDataPath:string = "./testData";
    const testDataSessionHistoryPath:string = "./testData/sessions";
    const sessionFilename:string = testDataPath + "/bunqSession.json";

});

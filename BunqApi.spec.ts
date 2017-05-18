import {} from 'jest';
import {BunqKey} from "./BunqKey";
import {BunqApi} from "./BunqApi";
import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnectionMock} from "./BunqConnection";
import * as fs from "fs-extra";
const NodeRSA = require('node-rsa');

describe("BunqApi", () => {

    const testDataPath:string = "./testData";
    const sessionFilename:string = testDataPath + "/bunqSession.json";
    const testDataSessionHistoryPath:string = "./testData/sessions";

    const connect = new BunqConnectionMock();

    const config:BunqApiConfig = new BunqApiConfig();
    const deviceServerConfig = config.readJson(testDataPath+"/bunqDeviceServerConfig.json");
    const privateKeyPem:string=config.read(testDataPath+"/privateKey.pem");
    const key : BunqKey = new BunqKey(privateKeyPem);
    const installationTokenConfig = config.readJson(testDataPath+"/bunqInstallationToken.json");
    const installationToken:string=installationTokenConfig.Response[1].Token.token;
    const setup : BunqApiSetup = new BunqApiSetup(connect,key,deviceServerConfig.secret, installationToken);
    const wrongKey : BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/wrongPrivateKey.pem");
    const wrongKeySetup : BunqApiSetup = new BunqApiSetup(connect, wrongKey, deviceServerConfig.secret, installationToken);
    const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup);
    const wrongKeyBunqApi:BunqApi = new BunqApi(connect,wrongKey,deviceServerConfig.secret, wrongKeySetup);

    it("can update an existing session token on disk by querying session server if needed", () => {
        if(fs.existsSync(sessionFilename)) {
            fs.unlinkSync(sessionFilename);
        }
        if(fs.existsSync(testDataSessionHistoryPath)) {
            fs.removeSync(testDataSessionHistoryPath);
        }
        bunqApi.updateSession(testDataPath).then(function(response:string){
            const token:string = response;
            //console.log("new token:"+token);
            expect(fs.exists(sessionFilename));
            bunqApi.updateSession(testDataPath).then(function(response:string) {
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

        if(fs.existsSync(sessionFilename)) {
            fs.unlinkSync(sessionFilename);
        }
        if(fs.existsSync(testDataSessionHistoryPath)) {
            fs.removeSync(testDataSessionHistoryPath);
        }
        wrongKeyBunqApi.updateSession(testDataPath).then(function(response:string){
            console.log("error! we should not be here! "+response);
            expect(true).toBeFalsy();
        }).catch(function(error){
            //console.log("expected error:"+error);
            expect(error).toEqual("signature wrong");
        });
    });

    it("can request user", () => {
        // const bunqApi:BunqApi = new BunqApi(key, deviceServerConfig.secret, sessionUpdater, connect);
        // bunqApi.requestUser().then(function(response:string) {
        //     console.log("ok:"+response);
        // }).catch(function(error:string){
        //    console.log(error);
        //    expect(true).toBeFalsy();
        // });
    });




});

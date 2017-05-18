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

    const deviceServerConfig = BunqApiConfig.readJson(testDataPath+"/bunqDeviceServerConfig.json");
    const privateKeyPem:string=BunqApiConfig.read(testDataPath+"/privateKey.pem");
    const key : BunqKey = new BunqKey(privateKeyPem);
    const installationTokenConfig = BunqApiConfig.readJson(testDataPath+"/bunqInstallationToken.json");
    const installationToken:string=installationTokenConfig.Response[1].Token.token;
    const setup : BunqApiSetup = new BunqApiSetup(connect,key,deviceServerConfig.secret, installationToken);
    const wrongKey : BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/wrongPrivateKey.pem");
    const wrongKeySetup : BunqApiSetup = new BunqApiSetup(connect, wrongKey, deviceServerConfig.secret, installationToken);

    const wrongKeyBunqApi:BunqApi = new BunqApi(connect,wrongKey,deviceServerConfig.secret, wrongKeySetup);

    it("creates a file with session token when updateSession is called", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup);
        removeSessionFiles();
        bunqApi.updateSession(testDataPath).then((response:string)=>{
            const token:string = response;
            //console.log("new token:"+token);
            expect(fs.exists(sessionFilename));
        }).catch(function(error:string){
            console.log("error1:"+error)
            expect(true).toBeFalsy();
        });
    });

    it("updates an existing session token file by querying session server if needed", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup);
        removeSessionFiles();
        bunqApi.updateSession(testDataPath).then((response:string)=>{
            const token:string = response;
            //console.log("new token:"+token);
            bunqApi.updateSession(testDataPath).then((response:string) =>{
                const sameToken:string = response;
                //console.log("same token:"+sameToken);
                expect(token).toEqual(sameToken);
            }).catch(function(error:string){
                console.log("error2:"+error)
                expect(true).toBeFalsy();
            });
        }).catch(function(error:string){
            console.log("error1:"+error)
            expect(true).toBeFalsy();
        });
    });

    it("updates internal sessionToken when updateSession is called", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup);
        removeSessionFiles();
        const beforeUpdateToken:string=bunqApi.getSessionToken();
        //console.log("before:"+beforeUpdateToken);
        expect(beforeUpdateToken.length).toEqual(0);
        bunqApi.updateSession(testDataPath).then((response:string)=>{
            const token:string = response;
            const afterUpdateToken:string=bunqApi.getSessionToken();
            //console.log("after:"+afterUpdateToken);
            expect(afterUpdateToken.length).toBeGreaterThan(0);
            //console.log("new token:"+token);
        }).catch(function(error:string){
            console.log("error1:"+error)
            expect(true).toBeFalsy();
        });
    });


    it("can not update session token from session server with wrong key", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup);
        removeSessionFiles();
        wrongKeyBunqApi.updateSession(testDataPath).then((response:string)=>{
            console.log("error! we should not be here! "+response);
            expect(true).toBeFalsy();
        }).catch(function(error){
            //console.log("expected error:"+error);
            expect(error).toEqual("signature wrong");
        });
    });

    it("can request user", () => {

        // bunqApi.requestUser().then(function(response:string) {
        //     console.log("ok:"+response);
        // }).catch(function(error:string){
        //    console.log(error);
        //    expect(true).toBeFalsy();
        // });
    });


    function removeSessionFiles():void {
        if(fs.existsSync(sessionFilename)) {
            fs.unlinkSync(sessionFilename);
        }
        if(fs.existsSync(testDataSessionHistoryPath)) {
            fs.removeSync(testDataSessionHistoryPath);
        }
    }


});

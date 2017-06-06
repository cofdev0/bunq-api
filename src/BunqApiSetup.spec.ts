import {} from 'jest';
import {BunqKey} from "./BunqKey";
import {BunqApiSetup} from "./BunqApiSetup";
import fs = require('fs-extra');
import {BunqConnectionMock} from "./BunqConnection";
import {BunqApiConfig} from "./BunqApiConfig";


describe("BunqApiSetup", () => {

    const config:BunqApiConfig = BunqApiConfig.createForSpecs();

    const testDataPath:string = config.json.secretsPath;

    const connect = new BunqConnectionMock();
    const deviceServerConfig = BunqApiConfig.readJson(config.json.secretsFile);
    const key : BunqKey = BunqKey.createFromPrivateKeyFile(config.json.privateKeyFile);
    const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
    const installationToken:string=installationTokenConfig.Response[1].Token.token;
    const setup : BunqApiSetup = new BunqApiSetup(connect, key, deviceServerConfig.secret, installationToken);
    const wrongKey : BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/wrongPrivateKey.pem");
    const wrongKeySetup : BunqApiSetup = new BunqApiSetup(connect, wrongKey, deviceServerConfig.secret, installationToken);

    it("can install a key with BunqConnectionMock", () => {
        const EXPECTED_INSTALLATION_TOKEN = "237049da3b2da8384adfe8a2aeec15788a79c3e20d62bc9602776c6090a5f194";
        setup.installKey().then(function(response:string){
            //console.log("ok:"+response);
            let resp : any = JSON.parse(response);
            expect(resp.Response[1].Token.token.indexOf(EXPECTED_INSTALLATION_TOKEN)).toBe(0);
        }).catch(function(error:string){
            console.log("error:"+error);
            expect(true).toBe(false);
        });
    });

    it("can setup device-server with BunqConnectionMock", () => {
        setup.createDeviceServer(deviceServerConfig.description).then(function(response:string){
            //console.log("ok:"+response);
            let resp : any = JSON.parse(response);
            expect(resp.Response[0].Id.id).toBeGreaterThan(0);
        }).catch(function(error:string){
            console.log("error:"+error);
            expect(true).toBe(false);
        });
    });

    it("can not setup device-server with BunqConnectionMock given wrong key", () => {
        wrongKeySetup.createDeviceServer(deviceServerConfig.description).then(function(){
            console.log("wrong key results in acceptance. this is wrong!");
            expect(true).toBe(false);
        }).catch(function(error:string){
            //console.log("this error is expected: "+error)
        });
    });

    it("can setup session-server with BunqConnectionMock", () => {
        setup.createSessionServer().then(function(response:string){
            //console.log("ok:"+response);
            let resp : any = JSON.parse(response);
            expect(resp.Response[1].Token.token.length).toBeGreaterThan(0);
        }).catch(function(error:string){
            console.log("error:"+error);
            expect(true).toBe(false);
        });
    });

    it("can not setup session-server with BunqConnectionMock given a wrong key", () => {
        wrongKeySetup.createSessionServer().then(function(response:string){
            console.log("this is not expected:"+response);
            expect(true).toBeFalsy();
        }).catch(function(error:string){
            // console.log("expected error:"+error)
            expect(error).toEqual("signature wrong");
        });
    });

    it("can not setup session-server with BunqConnectionMock given a wrong installation token", () => {
        const wrongInstTokenSetup : BunqApiSetup
            = new BunqApiSetup(connect, key, deviceServerConfig.secret, installationToken+"WrongNow");

        wrongInstTokenSetup.createSessionServer().then(function(response:string){
            console.log("this is not expected:"+response);
            expect(true).toBeFalsy();
        }).catch(function(error:string){
            // console.log("expected error:"+error)
            expect(error).toEqual("installation token wrong");
        });
    });




});

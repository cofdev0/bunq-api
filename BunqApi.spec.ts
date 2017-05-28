import {} from 'jest';
import {BunqKey} from "./BunqKey";
import {BunqApi} from "./BunqApi";
import {BunqApiConfig} from "./BunqApiConfig";
import {BunqApiSetup} from "./BunqApiSetup";
import {BunqConnectionMock} from "./BunqConnection";
import * as fs from "fs-extra";

var IBAN = require('iban');

const config:BunqApiConfig = BunqApiConfig.createForSpecs();
const testDataPath:string = config.json.secretsPath;
const sessionFilename:string = testDataPath + "/bunqSession.json";
const testDataSessionHistoryPath:string = config.json.bunqSessionHistoryPath;
const connect = new BunqConnectionMock();
const deviceServerConfig = BunqApiConfig.readJson(config.json.secretsFile);
const privateKeyPem:string=BunqApiConfig.read(config.json.privateKeyFile);
const key : BunqKey = new BunqKey(privateKeyPem);
const installationTokenConfig = BunqApiConfig.readJson(config.json.installationTokenFile);
const installationToken:string=installationTokenConfig.Response[1].Token.token;
const setup : BunqApiSetup = new BunqApiSetup(connect,key,deviceServerConfig.secret, installationToken);
const wrongKey : BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/wrongPrivateKey.pem");
const wrongKeySetup : BunqApiSetup = new BunqApiSetup(connect, wrongKey, deviceServerConfig.secret, installationToken);

const wrongKeyBunqApi:BunqApi = new BunqApi(connect, wrongKey, deviceServerConfig.secret, wrongKeySetup,
    config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);

describe("BunqApi", () => {


    it("creates a file with session token when updateSession is called", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret,
            setup, config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        removeSessionFiles();
        bunqApi.updateSession().then((response:string)=>{
            const token:string = response;
            //console.log("new token:"+token);
            expect(fs.exists(sessionFilename));
        }).catch(function(error:string){
            console.log("error1:"+error)
            expect(true).toBeFalsy();
        });
    });

    it("does not update an existing session token file if not older than a day", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        removeSessionFiles();
        bunqApi.updateSession().then((response:string)=>{
            const token:string = response;
            //console.log("new token:"+token);
            bunqApi.updateSession().then((response:string) =>{
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

    it("updates an existing session token file if too old", () => {
        const expectedToken:string="b165cce82bbd229b55962f90b4efedd706b3f616f0de831547ff62262f2924e3";
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        removeSessionFiles();
        const bunqSessionOldJson:any=BunqApiConfig.readJson(testDataPath+"/bunqSessionOld.json");
        fs.writeFileSync(config.json.bunqSessionFile, JSON.stringify(bunqSessionOldJson));
        bunqApi.updateSession().then((response:string)=>{
            const token:string = response;
            //console.log("new token:"+token);
            expect(token).toEqual(expectedToken);
        }).catch(function(error:string){
            console.log("error1:"+error)
            expect(true).toBeFalsy();
        });
    });

    it("updates internal sessionToken when updateSession is called", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        removeSessionFiles();
        const beforeUpdateToken:string=bunqApi.getSessionToken();
        //console.log("before:"+beforeUpdateToken);
        expect(beforeUpdateToken.length).toEqual(0);
        bunqApi.updateSession().then((response:string)=>{
            //const token:string = response;
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
        removeSessionFiles();
        wrongKeyBunqApi.updateSession().then((response:string)=>{
            console.log("error! we should not be here! "+response);
            expect(true).toBeFalsy();
        }).catch(function(error){
            //console.log("expected error:"+error);
            expect(error).toEqual("signature wrong");
        });
    });

    it("can request user", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.requestUser().then((response:string)=>{
            //console.log("ok:"+response);
            let resp:any = JSON.parse(response);
            expect(resp.Response[0].UserCompany.id).toBe(42);
        }).catch(function(error:string){
           console.log(error);
           expect(true).toBeFalsy();
        });
    });

    it("can request all accounts of user with MonetaryAccountBank", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.requestMonetaryAccountBank(deviceServerConfig.userId).then((response:string)=>{
            //console.log("ok:"+response);
            let resp:any = JSON.parse(response);
            expect(resp.Response[0].MonetaryAccountBank.balance.value).toBe("12.50");
        }).catch(function(error:string){
            console.log(error);
            expect(true).toBeFalsy();
        });
    });

    it("can request a single account of user with MonetaryAccountBank", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.requestMonetaryAccountBank(deviceServerConfig.userId, "42").then((response:string)=>{
            //console.log("ok:"+response);
            let resp:any = JSON.parse(response);
            expect(resp.Response[0].MonetaryAccountBank.balance.value).toBe("12.50");
        }).catch(function(error:string){
            console.log(error);
            expect(true).toBeFalsy();
        });
    });

    it("can request list of payments", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.requestPayments(deviceServerConfig.userId, deviceServerConfig.accountId).then((response:string)=>{
            //console.log("ok:"+response);
            let resp:any = JSON.parse(response);
            expect(resp.Response[0].Payment.amount.value).toBe("12.50");
        }).catch(function(error:string){
            console.log(error);
            expect(true).toBeFalsy();
        });
    });

    it("can send payment", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.sendPayment(deviceServerConfig.userId, deviceServerConfig.accountId,
            "1.1", "THISisANiban", "nemoUnknown", "simple payment"
            ).then((response:string)=>{
            //console.log("ok:"+response);
            let resp:any = JSON.parse(response);
            expect(resp.Response[0].Id.id).toBe(20);
        }).catch(function(error:string){
            console.log(error);
            expect(true).toBeFalsy();
        });
    });

    it("can not request something weird", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.requestSomething().then((response:string)=>{
            console.log("should not be here! "+response);
            expect(true).toBeFalsy();
        }).catch(function(error:string){
            //console.log(error);
            expect(error).toBe("unknown endPoint");
        });
    });

    it("can install notification filter", () => {
        const bunqApi:BunqApi = new BunqApi(connect, key,deviceServerConfig.secret, setup,
            config.json.bunqSessionFile, config.json.bunqSessionHistoryPath);
        bunqApi.installNotificationFilter(deviceServerConfig.userId, deviceServerConfig.accountId,
                "https://my.company.com/callback-url").then((response:string)=>{
            //console.log("ok:"+response);
            let resp:any = JSON.parse(response);
            expect(resp.Response[0].Id.id).toBe(444);
        }).catch(function(error:string){
            console.log(error);
            expect(true).toBeFalsy();
        });
    });

    it("can recognize a valid and invalid IBAN number", () => {
        expect(IBAN.isValid("invalidIban")).toBeFalsy();
        expect(IBAN.isValid("NL09BUNQ2290519588")).toBeTruthy();
        expect(IBAN.isValid("NL09BUNQ22905195886666")).toBeFalsy();
        expect(IBAN.isValid("NL09BUNQ2290519589")).toBeFalsy();
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

import {} from 'jest';
import {BunqKey} from "./BunqKey";
import {BunqApiConfig} from "./BunqApiConfig";
const NodeRSA = require('node-rsa');

const config:BunqApiConfig = BunqApiConfig.createForSpecs();
const testDataPath:string = config.json.secretsPath;
const input = "this is the string to encode and decode";
const bunqKey : BunqKey = BunqKey.createFromPrivateKeyFile(config.json.privateKeyFile);
const otherKey:BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/wrongPrivateKey.pem");
const key = bunqKey.key;
const pubKey = new NodeRSA();
pubKey.importKey(bunqKey.toPublicKeyString(),'public');

//todo: hide key in BunqKey and create wrapper methods

describe("BunqKey", () => {

    test("key is valid", () => {
        expect(key.isEmpty()).toBe(false);
        expect(key.getKeySize()).toBe(2048);
        expect(key.getMaxMessageSize()).toBeGreaterThan(200);
    });

    test("privKey encoded string equals decoded string", () => {

        let encrypted = key.encrypt(input, 'base64');
        let decrypted = key.decrypt(encrypted, 'utf8');
        expect(decrypted).toMatch(input);
    });

    test("pubKey encoded string equals decoded string", () => {
        let encrypted = pubKey.encrypt(input, 'base64');
        let decrypted = key.decrypt(encrypted, 'utf8');
        expect(decrypted).toMatch(input);
    });

    test("signature with privateKey is valid", () => {
        let sig = key.sign(input,'base64','utf8');
        expect(key.verify(input, sig, 'utf8','base64')).toBe(true);
    });

    test("signature with otherKey is invalid", () => {
        let sig = otherKey.key.sign(input,'base64','utf8');
        expect(key.verify(input, sig, 'utf8','base64')).toBe(false);
    });

    test("signature with privateKey is valid, verified with pubKey", () => {
        let sig = key.sign(input,'base64','utf8');
        expect(pubKey.verify(input, sig, 'utf8','base64')).toBe(true);
    });

    test("invalid signature with privateKey is invalid, verified with pubKey", () => {
        let sig = key.sign(input,'base64','utf8');
        expect(pubKey.verify(input+"invalidate", sig, 'utf8','base64')).toBe(false);
    });

    test("exporting private pem key works",() => {
        let privatePem:string = bunqKey.toPrivateKeyString();
        let newKey:BunqKey = new BunqKey(privatePem);
        let encrypted = newKey.key.encrypt(input, 'base64');
        let decrypted = key.decrypt(encrypted, 'utf8');
        expect(decrypted).toMatch(input);
    });

});

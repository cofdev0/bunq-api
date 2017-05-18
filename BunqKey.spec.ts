import {} from 'jest';
import {BunqKey} from "./BunqKey";
const NodeRSA = require('node-rsa');

describe("BunqKey", () => {

    const testDataPath:string = "./testData";
    const  input = "this is the string to encode and decode";
    const bunqKey:BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/privateKey.pem");
    const otherKey:BunqKey = BunqKey.createFromPrivateKeyFile(testDataPath+"/WrongPrivateKey.pem");
    const key = bunqKey.key;
    const pubKey = new NodeRSA();
    pubKey.importKey(bunqKey.toPublicKeyString(),'public');

    test("that key is valid", () => {
        expect(key.isEmpty()).toBe(false);
        expect(key.getKeySize()).toBe(2048);
        expect(key.getMaxMessageSize()).toBeGreaterThan(200);
    });

    test("that privKey encoded string equals decoded string", () => {

        let encrypted = key.encrypt(input, 'base64');
        let decrypted = key.decrypt(encrypted, 'utf8');
        expect(decrypted).toMatch(input);
    });

    test("that pubKey encoded string equals decoded string", () => {
        let encrypted = pubKey.encrypt(input, 'base64');
        let decrypted = key.decrypt(encrypted, 'utf8');
        expect(decrypted).toMatch(input);
    });

    test("that signature with privateKey is valid", () => {
        let sig = key.sign(input,'base64','utf8');
        expect(key.verify(input, sig, 'utf8','base64')).toBe(true);
    });

    test("that signature with privateKey is valid, verified with pubKey", () => {
        let sig = key.sign(input,'base64','utf8');
        expect(pubKey.verify(input, sig, 'utf8','base64')).toBe(true);
    });

    test("that invalid signature with privateKey is invalid, verified with pubKey", () => {
        let sig = key.sign(input,'base64','utf8');
        expect(pubKey.verify(input+"invalidate", sig, 'utf8','base64')).toBe(false);
    });

    test("that exporting private pem key works",() => {
        let privatePem:string = bunqKey.toPrivateKeyString();
        let newKey:BunqKey = new BunqKey(privatePem);
        let encrypted = newKey.key.encrypt(input, 'base64');
        let decrypted = key.decrypt(encrypted, 'utf8');
        expect(decrypted).toMatch(input);
    });

});

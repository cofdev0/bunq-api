const NodeRSA = require('node-rsa');
import {} from 'jest';
import {BunqKey} from "./BunqKey";

describe("BunqKey", () => {

    let input = "this is the string to encode and decode";
    let bunqKey = new BunqKey();
    let key = bunqKey.key;
    let pubKey = new NodeRSA();
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

});

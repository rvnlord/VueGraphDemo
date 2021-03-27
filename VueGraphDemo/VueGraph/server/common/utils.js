const SHA256 = require("crypto-js/sha256");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const uuidV1 = require("uuid/v1");

class Utils {

    static sha256(data) {
        return SHA256(data).toString();
    }
    
    static genECKeyPair() {
        return ec.genKeyPair();
    }

    static verifySignature(publicKey, signature, dataHash) {
        return ec.keyFromPublic(publicKey, "hex").verify(dataHash, signature);
    }

    static id() {
        return uuidV1();
    }
}

module.exports = Utils;
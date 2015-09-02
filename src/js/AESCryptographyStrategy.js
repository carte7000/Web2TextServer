var CryptoJS = require("CryptoJS");

//var options = { iv: CryptoJS.PBKDF2("allo", "salt", { keySize: 128/32 }), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };

var IV = "F27D5C9927726BCEFE7510B1BDD3D137";
var SALT = "3FF2EC019C627B945225DEBAD71A01B6985FE84C95A70EB132882F88C0A59A55";
var keySize = 128;
var iterationCount = 2;

var encryptAES = function(message, key){
    var aesUtil = new AesUtil(keySize, iterationCount);
    return aesUtil.encrypt(SALT, IV, key, message);
}

var decryptAES = function(encrypted, key){
    var aesUtil = new AesUtil(keySize, iterationCount);
    return aesUtil.decrypt(SALT, IV, key, encrypted);
}


/*var getKey = function(value){
    return CryptoJS.PBKDF2(value, "salt", { keySize: 128/32 });//CryptoJS.PBKDF2(value, "test", { keySize: 128 });
}*/


var DESCryptographyStrategy = {
    encrypt: encryptAES,
    decrypt: decryptAES
}

var AesUtil = function(keySize, iterationCount) {
  this.keySize = keySize / 32;
  this.iterationCount = iterationCount;
};

AesUtil.prototype.generateKey = function(salt, passPhrase) {
  var key = CryptoJS.PBKDF2(
      passPhrase, 
      CryptoJS.enc.Hex.parse(salt),
      { keySize: this.keySize, iterations: this.iterationCount });
  return key;
}

AesUtil.prototype.encrypt = function(salt, iv, passPhrase, plainText) {
  var key = this.generateKey(salt, passPhrase);
  var encrypted = CryptoJS.AES.encrypt(
      plainText,
      key,
      { iv: CryptoJS.enc.Hex.parse(iv) });
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

AesUtil.prototype.decrypt = function(salt, iv, passPhrase, cipherText) {
  var key = this.generateKey(salt, passPhrase);
  var cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(cipherText)
  });
  var decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      { iv: CryptoJS.enc.Hex.parse(iv) });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports = DESCryptographyStrategy;
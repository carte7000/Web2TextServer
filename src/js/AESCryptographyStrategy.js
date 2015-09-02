var AESCryptographyStrategy = function(pKey){
    this.mKey = pKey;

    var CryptoJS = require("CryptoJS");

    var IV = "F27D5C9927726BCEFE7510B1BDD3D137";
var SALT = "3FF2EC019C627B945225DEBAD71A01B6985FE84C95A70EB132882F88C0A59A55";
var keySize = 128;
var iterationCount = 2;

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
this.encryptAES = function(message, key){
      var aesUtil = new AesUtil(keySize, iterationCount);
      return aesUtil.encrypt(SALT, IV, key, message);
    }

    this.decryptAES = function(encrypted, key){
      var aesUtil = new AesUtil(keySize, iterationCount);
      return aesUtil.decrypt(SALT, IV, key, encrypted);
    }
}

AESCryptographyStrategy.prototype.encrypt = function(message){
  var encryptedMessage = JSON.parse(JSON.stringify(message));;
  encryptedMessage.content = this.encryptAES(encryptedMessage.content, this.mKey);
  return encryptedMessage;
}

AESCryptographyStrategy.prototype.decrypt = function(encrypted){
  var decryptedMessage = JSON.parse(JSON.stringify(encrypted));;
  decryptedMessage.content = this.decryptAES(decryptedMessage.content, this.mKey);
  return decryptedMessage;
}

module.exports = AESCryptographyStrategy;
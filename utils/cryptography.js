// const Cryptr = require("cryptr");
// const cryptr = new Cryptr(
//   "fkjawfhjdhfjkhfhrifruhuihiwuhfuiwhfiurhfufkljef3jfqeif"
// );

// function encrypt(msg) {
//   const encryptedString = cryptr.encrypt(msg);
//   console.log(encryptedString);
//   return encryptedString;
// }

// function decrypt(encryptedString) {
//   console.log(encryptedString);
//   const decryptedString = cryptr.decrypt(encryptedString);
//   console.log(decryptedString);
//   return decryptedString;
// }

// module.exports = { encrypt, decrypt };
const Cryptr = require("cryptr");

// ✅ Strong secret key
const cryptr = new Cryptr(
  "56dce7276d2b0a24e032beedf0473d743dbacf92aafe898e5a0f8d9898c9eae80a73798beed53489e8dbfd94191c1f28dc58cad12321d8150b93a2e092a744265fd214d7c2ef079e2f01b6d06319b7b2"
);

function encrypt(message) {
  try {
    return cryptr.encrypt(message);
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

function decrypt(message) {
  try {
    return cryptr.decrypt(message);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

module.exports = { encrypt, decrypt };

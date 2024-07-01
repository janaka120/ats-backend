const validator = require('email-validator');

function isValidEmailList(emails) {
  for (let email of emails) {
    const isValid = validator.validate(email);
    if (!isValid) {
      return false;
    }
  }
  return true;
}

function retrieveEmailAddressInString(text) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const emailAddresses = text.match(emailRegex);
    return emailAddresses || [];
}

module.exports = { isValidEmailList, retrieveEmailAddressInString };

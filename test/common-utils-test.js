const chai = require('chai');
const expect = chai.expect;

const { retrieveEmailAddressInString } = require('../utils/common-utils'); // Replace with actual file path

describe('retrieveEmailAddressInString Function test', () => {
  it('should return an empty array for a string without emails', () => {
    const text = 'Hey everybody.';
    const expectedEmails = [];

    const result = retrieveEmailAddressInString(text);
    expect(result).to.deep.equal(expectedEmails);
  });
 
  it('should handle invalid email addresses', () => {
    const text = 'This text has an invalid email @invalid.email.';
    const expectedEmails = [];

    const result = retrieveEmailAddressInString(text);
    expect(result).to.deep.equal(expectedEmails);
  });

  it('should be select correct emails', () => {
    const text = 'Hello students! @STUDENTAGNES@GMAIL.COM @STUDENTAGNES@GMAIL.COM';
    const expectedEmails = ['STUDENTAGNES@GMAIL.COM', 'STUDENTAGNES@GMAIL.COM'];

    const result = retrieveEmailAddressInString(text);
    expect(result).to.deep.equal(expectedEmails);
  });
});
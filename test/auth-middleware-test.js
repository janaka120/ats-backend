const chai = require('chai');
const assert = chai.expect;
const authMiddleware = require('../middleware/is-auth.js');

describe('Auth middleware', function() {
    it('should throw an error if no authorization header is present', function() {
        const req = {
            get: function(headerName) {
                return null;
            }
        };
        assert(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.')
    });
})

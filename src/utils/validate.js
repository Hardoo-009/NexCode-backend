const validator = require('validator');
const validate = (body) => {
    const required = ['firstName', 'emailId', 'password'];

    const isPresent = required.every((field) =>
        Object.keys(body).includes(field),
    );

    if (!isPresent) {
        throw new Error('Some field is missing');
    }

    if (!validator.isEmail(body.emailId)) {
        throw new Error('EmailId is Wrong');
    }

    if (!validator.isStrongPassword(body.password)) {
        throw new Error('Weak password');
    }
};

module.exports = validate;

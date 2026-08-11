const validate = require('../utils/validate');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// register -> during the registration the user will get a jwt
const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        // make the user in the database then make the jwt and send it via cookie
        const user = await User.create(req.body);
        const token = jwt.sign(
            { _id: user._id, emailId: emailId },
            process.env.SECRET_KEY,
            {
                expiresIn: 60 * 60,
            },
        );
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 1000,
        });
    } catch (error) {
        res.status(400).send('Error Occured ' + error);
    }
};

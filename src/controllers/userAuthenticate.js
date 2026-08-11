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
        return res.status(201).send('User registered successfully');
    } catch (error) {
        return res.status(400).send('Error Occured ' + error);
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId) throw new Error('Invalid Credentials');
        if (!password) throw new Error('Invalid Credentials');
        // find the user if it exists
        const user = await User.findOne({ emailId });
        if (!user) throw new Error('Invalid Credentials');
        //compared the password
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Invalid Credentials');
        // maybe the user is logging in with his created account so again make a jwt token and send it
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
        return res.status(200).send('User loggedIn successfully');
    } catch (error) {
        return res.status(401).send('Error : ' + err.message);
    }
};

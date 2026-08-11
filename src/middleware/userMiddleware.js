const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');
const userMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).send('Token is not present.');
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        // if the payload is not present this will thorow an error automatically
        const { _id } = payload;
        if (!_id) return res.status(401).send('User id is not present');
        // check in the db if the user is present or somebody deleted him
        const result = await User.findById({ _id });
        if (!result) res.status(401).send('User is not present');
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) return res.status(401).send('Token is blocked.');

        req.result = result;
        next();
    } catch (error) {
        res.status(401).send(error.message);
    }
};

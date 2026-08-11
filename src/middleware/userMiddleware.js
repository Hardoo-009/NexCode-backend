const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const userMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send('Token is not present.');
        }

        const payload = jwt.verify(token, process.env.SECRET_KEY);

        // redis to check whether the token is in the blocked list
        const isBlocked = await redisClient.exists(`token:${token}`);

        if (isBlocked) {
            return res.status(401).send('Token is blocked.');
        }

        const { _id } = payload;

        if (!_id) {
            return res.status(401).send('User ID is not present.');
        }

        // Check whether the user still exists maybe the user has been deleted from the db
        const user = await User.findById(_id);

        if (!user) {
            return res.status(401).send('User is not present.');
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).send(error.message);
    }
};

module.exports = userMiddleware;

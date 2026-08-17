const validate = require('../utils/validate');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
// register -> during the registration the user will get a jwt
const register = async (req, res) => {
  try {
    validate(req.body);
    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'user';
    // make the user in the database then make the jwt and send it via cookie
    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: 'user' },
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
      { _id: user._id, emailId: emailId, role: user.role },
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
    return res.status(200).send('User logged In successfully');
  } catch (error) {
    return res.status(401).send('Error : ' + error.message);
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    // block the token inside redis
    await redisClient.set(`token:${token}`, 'blocked');
    // have to add the expiry time , which is present in the payload of the token
    const payload = jwt.decode(token);

    if (!payload || !payload.exp) {
      return res.status(400).send('Invalid token.');
    }

    await redisClient.expireAt(`token:${token}`, payload.exp);
    // now we have to remove the jwt present in the browser
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    return res.status(200).send('Logged out successfully.');
  } catch (error) {
    return res.status(500).send('Logout failed.');
  }
};
// admin has the power of making a admin as well as a normal user
const adminRegister = async (req, res) => {
  try {
    // actually now the admin is being created , after going through the middleware
    validate(req.body);
    const { firstName, emailId, password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    // make the user in the database then make the jwt and send it via cookie
    const user = await User.create(req.body);
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
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
    return res.status(201).send('Admin registered successfully');
  } catch (error) {
    return res.status(400).send('Error Occured ' + error);
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    // first delete the user profile from the user schema
    await User.findByIdAndDelete(userId);
    // now delete the submission he has done , all this submissions
    await Submission.deleteMany({ userId });

    res.status(200).send('Deleted Successfully....');
  } catch (err) {
    return res.status(500).send('Internal Server Error...');
  }
};
module.exports = { register, login, logout, adminRegister, deleteProfile };

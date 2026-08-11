const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 30,
        },
        lastName: {
            type: String,
            required: false,
            minLength: 3,
            maxLength: 20,
        },
        emailId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            immutable: true,
        },
        age: {
            type: Number,
            min: 6,
            max: 80,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        problemSolved: {
            type: [String],
        },
        password: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

const User = mongoose.model('user', UserSchema);
module.exports = User;

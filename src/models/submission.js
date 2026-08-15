const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      // refPath: 'userModel', // <-- dynamic instead of ref: 'User'
      ref: 'user',
    },
    // userModel: {
    //   type: String,
    //   required: true,
    //   enum: ['User', 'Googleuser'], // must exactly match your mongoose.model() names
    // },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'problem',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['javascript', 'cpp', 'java'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'wrong', 'error'],
      default: 'pending',
    },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    errorMessage: { type: String, default: '' },
    testCasesPassed: { type: Number, default: 0 },
    testCasesTotal: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

//submissionSchema.index({ userId: 1, problemId: 1 });

const Submission = mongoose.model('submission', submissionSchema);
module.exports = Submission;

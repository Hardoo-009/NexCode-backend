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

submissionSchema.index({ userId: 1, problemId: 1 });
// we have to make a index of a combination of userid and pid , compound indexing
// and 1 here means ascending order , and only userId can also be an index here , because it is given in the beginning , it sorts first userId and then pid
// a B+ tree is maintained to make efficient queries
// _id are already indexed , and then making a thing as unique also makes a indexing of it

const Submission = mongoose.model('submission', submissionSchema);
module.exports = Submission;

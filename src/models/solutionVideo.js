const mongoose = require('mongoose');
const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'problem',
      required: true,
    },
    userId: {
      // admin user who uploaded the video
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    cloudinaryPublicId: {
      // Unique identifier for the video in Cloudinary
      type: String,
      required: true,
      unique: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SolutionVideo = mongoose.model('solutionVideo', videoSchema);

module.exports = SolutionVideo;

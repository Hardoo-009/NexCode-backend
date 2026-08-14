const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },

        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },

        tags: [
            {
                type: String,
                enum: ['array', 'linkedlist', 'graph', 'dp'],
            },
        ],
        visibleTestCases: [
            {
                input: {
                    type: String,
                    required: true,
                },

                output: {
                    type: String,
                    required: true,
                },

                explanation: {
                    type: String,
                    required: true,
                },
            },
        ],
        hiddenTestCases: [
            {
                input: {
                    type: String,
                    required: true,
                },

                output: {
                    type: String,
                    required: true,
                },
            },
        ],

        starterCode: [
            {
                language: {
                    type: String,
                    required: true,
                },

                boilerplateCode: {
                    type: String,
                    required: true,
                },
            },
        ],
        referenceSolution: [
            {
                language: {
                    type: String,
                    required: true,
                },

                completeCode: {
                    type: String,
                    required: true,
                },
            },
        ],
        problemCreator: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
    },
    { timestamps: true },
);

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;

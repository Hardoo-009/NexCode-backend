Sample code for pagination :
const getProblems = async (req, res) => {
try {
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [problems, totalProblems] = await Promise.all([
            Problem.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            Problem.countDocuments()
        ]);

        const totalPages = Math.ceil(totalProblems / limit);

        res.status(200).json({
            problems,
            currentPage: page,
            totalPages,
            totalProblems,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch problems"
        });
    }

};

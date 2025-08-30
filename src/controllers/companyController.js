const { getCompanies } = require('../services/companyServices');

exports.getCompaniesController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const filters = {
            cityId: req.query.cityId,
            regionId: req.query.regionId,
            status: req.query.status,
            name: req.query.name,
        };

        const { rows, total } = await getCompanies(filters, { limit, offset }, req.user.type);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No companies found' });
        }

        res.json({
            companies: rows,
            pagination: {
                total,
                page,
                pageSize: limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

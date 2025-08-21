/**
 * @swagger
 * /fuel:
 *   get:
 *     summary: Get all fuel types
 *     description: Retrieve a list of all available fuel types.
 *     tags:
 *       - Fuel
 *     responses:
 *       200:
 *         description: List of fuel types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 fuel_types:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Petrol"
 *                       description:
 *                         type: string
 *                         example: "Regular unleaded fuel"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 */

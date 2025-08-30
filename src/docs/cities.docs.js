/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Get cities by region
 *     description: Retrieve a list of cities filtered by a specific region ID.
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Region ID to filter cities
 *     responses:
 *       200:
 *         description: List of cities successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Cairo"
 *                       region_id:
 *                         type: integer
 *                         example: 3
 *       400:
 *         description: regionId is missing, invalid, or not found
 *       500:
 *         description: Internal server error
 */

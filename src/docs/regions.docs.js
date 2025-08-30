/**
 * @swagger
 * /regions:
 *   get:
 *     summary: Get all regions
 *     description: Retrieve a list of all regions available in the system.
 *     tags:
 *       - Regions
 *     responses:
 *       200:
 *         description: List of regions successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 regions:
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
 *       500:
 *         description: Internal server error
 */

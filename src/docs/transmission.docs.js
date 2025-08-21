/**
 * @swagger
 * /transmission:
 *   get:
 *     summary: Get all transmission types
 *     description: Retrieve a list of all available transmission types.
 *     tags:
 *       - Transmission
 *     responses:
 *       200:
 *         description: List of transmission types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transmission_types:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Automatic"
 *                       description:
 *                         type: string
 *                         example: "Fully automatic transmission"
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

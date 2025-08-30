/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Get cities
 *     description: |
 *       - If no `regionId` is provided → returns **all cities** with their region.  
 *       - If `regionId` is provided → returns only the cities belonging to that region.  
 *     tags:
 *       - Cities
 *     parameters:
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: integer
 *         required: false
 *         description: Optional region ID to filter cities.
 *     responses:
 *       200:
 *         description: A list of cities.
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
 *                       region:
 *                         type: string
 *                         example: "Greater Cairo"
 *       400:
 *         description: Region not found (if invalid regionId is provided).
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
 *                   example: "Region not found"
 *       500:
 *         description: Server error
 */

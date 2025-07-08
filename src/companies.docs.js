/**
 * @swagger
 * /companies/register:
 *   post:
 *     summary: Register a new company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *             required: [name, email, password, phone]
 *     responses:
 *       201:
 *         description: Company registered successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /companies/login:
 *   post:
 *     summary: Login as a company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /companies/profile:
 *   get:
 *     summary: Get logged-in company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found
 */

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

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company profile retrieved
 *       404:
 *         description: Company not found
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies with pagination
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page (default is 10)
 *     responses:
 *       200:
 *         description: List of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       phone:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: No companies found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Delete a company by ID (superadmin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the company to delete
 *     responses:
 *       200:
 *         description: Company deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company deleted successfully
 *       404:
 *         description: Company not found
 *       403:
 *         description: Access denied (Only superadmins)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Admin updates any company (including status)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID to update
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
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, suspended, deleted, rejected]
 *                 description: Only admins can change the status
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       400:
 *         description: No fields to update or invalid status
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /companies/profile:
 *   put:
 *     summary: Update logged-in company's profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               profile_pic:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               name: "Ahmed Ala`a"
 *               phone: "01123456789"
 *               email: "aa@aa.com"
 *               profile_pic: "https://example.com/profile.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only users can update their profile
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /companies/reset-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Companies]
 *     description: Sends a password reset link to the user's email. The link includes a secure token for verifying the reset request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset link sent to email
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email not found
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many requests, please try again later
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */


/**
 * @swagger
 * /companies/update-password:
 *   post:
 *     summary: Change logged-in company's password
 *     description: Only users with role "company" can change their own password.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "newStrongPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Old password is incorrect or missing fields
 *       401:
 *         description: Unauthorized (no token provided)
 *       403:
 *         description: Forbidden (only users can change their passwords)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

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
 *     summary: Get logged-in company's profile
 *     description: Retrieve full profile details for the authenticated company.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Ahmed Ala`a"
 *                     email:
 *                       type: string
 *                       example: "aa@aa.com"
 *                     phone:
 *                       type: string
 *                       example: "01123456789"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     profile_pic:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     address:
 *                       type: string
 *                       example: "123 Street, Cairo"
 *                     city:
 *                       type: string
 *                       example: "Cairo"
 *                     region:
 *                       type: string
 *                       example: "Giza"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Only companies can access this profile
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     description: Retrieve public profile information of a company by its ID.
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the company
 *     responses:
 *       200:
 *         description: Company profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Ahmed Ala`a"
 *                     email:
 *                       type: string
 *                       example: "aa@aa.com"
 *                     phone:
 *                       type: string
 *                       example: "01123456789"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     profile_pic:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     address:
 *                       type: string
 *                       example: "123 Street, Cairo"
 *                     city:
 *                       type: string
 *                       example: "Cairo"
 *                     region:
 *                       type: string
 *                       example: "Giza"
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get list of companies
 *     description: Retrieve a paginated list of companies. Admins will see all details, while normal users will see limited public info.
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of companies per page
 *     responses:
 *       200:
 *         description: Paginated list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/CompanyAdmin'
 *                       - $ref: '#/components/schemas/CompanyPublic'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 35
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No companies found
 *       500:
 *         description: Server error
 *
 * components:
 *   schemas:
 *     CompanyPublic:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Ahmed Ala`a"
 *         email:
 *           type: string
 *           example: "aa@aa.com"
 *         phone:
 *           type: string
 *           example: "01123456789"
 *         profile_pic:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *     CompanyAdmin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         name:
 *           type: string
 *           example: "Ahmed Ala`a"
 *         email:
 *           type: string
 *           example: "aa@aa.com"
 *         phone:
 *           type: string
 *           example: "01123456789"
 *         profile_pic:
 *           type: string
 *           example: "https://example.com/profile.jpg"
 *         address:
 *           type: string
 *           example: "123 Street, Cairo"
 *         city:
 *           type: string
 *           example: "Cairo"
 *         region:
 *           type: string
 *           example: "Giza"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-20T12:34:56Z"
 *         is_verified:
 *           type: boolean
 *           example: true
 *         status:
 *           type: string
 *           example: "active"
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
 *     description: Update company profile information. Each field has a maximum length restriction.
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
 *                 maxLength: 100
 *                 example: "Ahmed Ala`a"
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 example: "01123456789"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *                 example: "aa@aa.com"
 *               profile_pic:
 *                 type: string
 *                 maxLength: 255
 *                 example: "https://example.com/profile.jpg"
 *               address:
 *                 type: string
 *                 maxLength: 150
 *                 example: "123 Street, Cairo"
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Cairo"
 *               region:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Giza"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed (e.g. field too long or no fields to update)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Only company users can update their profile
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

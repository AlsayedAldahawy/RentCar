// 📁 src/docs/users.docs.js

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
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
 *               profilePic:
 *                 type: string
 *             required: [name, email, password, phone]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with email and password, returns a JWT token on success.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecurePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     pfp:
 *                       type: string
 *                       example: https://example.com/profile.jpg
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       401:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please verify your email first
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     is_verified:
 *                       type: boolean
 *       403:
 *         description: Unauthorized (Admins only)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users with optional filters and pagination (Admins only)
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name (partial match)
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email (partial match)
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Filter by phone (partial match)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, suspended, deleted, rejected]
 *         description: Filter by account status
 *       - in: query
 *         name: is_verified
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by verification status (0 = not verified, 1 = verified)
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
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
 *                       phone:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       profile_pic:
 *                         type: string
 *                       status:
 *                         type: string
 *                       is_verified:
 *                         type: integer
 *                         enum: [0, 1]
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - only accessible by superadmin or moderator
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update logged-in user's profile
 *     tags: [Users]
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
 *               name: Ahmed Ali
 *               phone: "01123456789"
 *               profile_pic: "https://example.com/profile.jpg"
 *               password: "newpassword123"
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
 * /users/{id}:
 *   put:
 *     summary: Update user data by admin (including status and verification)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to update
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, suspended, deleted, rejected]
 *               is_verified:
 *                 type: integer
 *                 enum: [0, 1]
 *             example:
 *               name: John Doe
 *               phone: "01234567890"
 *               profile_pic: "https://example.com/user.png"
 *               password: "adminReset123"
 *               status: active
 *               is_verified: 1
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can access
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Request password reset link
 *     tags: [Users]
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

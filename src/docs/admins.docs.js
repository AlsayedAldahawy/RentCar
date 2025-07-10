/**
 * @swagger
 * /admins/login:
 *   post:
 *     tags:
 *       - Admins
 *     summary: Admin login (superadmin or moderator)
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
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admins:
 *   post:
 *     tags:
 *       - Admins
 *     summary: Create a new admin (superadmin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [superadmin, moderator]
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Validation error or email exists
 *       500:
 *         description: Server error
 *
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get all admins (superadmin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admins
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     tags:
 *       - Admins
 *     summary: Delete an admin (superadmin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     tags:
 *       - Admins
 *     summary: Update an admin (self or superadmin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
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
 *               role:
 *                 type: string
 *                 enum: [superadmin, moderator]
 *     responses:
 *       200:
 *         description: Admin updated
 *       400:
 *         description: Validation or no fields to update
 *       403:
 *         description: Not allowed
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admins/profile:
 *   get:
 *     tags:
 *       - Admins
 *     summary: Get the profile of the logged-in admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile data
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Get admin by ID (superadmin only)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin profile retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Admin not found
 */

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
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: integer
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
 *     summary: Get current admin profile
 *     description: Retrieve the profile of the currently logged-in admin. Accessible by superadmin and moderator.
 *     tags:
 *       - Admins
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *                     phone:
 *                       type: string
 *                       example: "+212600000000"
 *                     role:
 *                       type: string
 *                       example: "Moderator"
 *       404:
 *         description: Admin not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error: Internal Server Error"
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

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Update an admin
 *     description: Update an admin's information. Only superadmin can update roles or status, and edit other admins.
 *     tags:
 *       - Admins
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the admin to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePass123"
 *               phone:
 *                 type: string
 *                 example: "+212600000001"
 *               role:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: ["Active", "Suspended"]
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin updated successfully"
 *       400:
 *         description: Bad request (invalid input or email already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid role id"
 *       403:
 *         description: Forbidden (not allowed to edit)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not allowed to edit other admins"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error: Internal Server Error"
 */

/**
 * @swagger
 * /admins:
 *   get:
 *     summary: Get all admins
 *     description: Retrieve a paginated list of all admins with their roles and status. Accessible by superadmins only. Optional filters for status and role_id.
 *     tags:
 *       - Admins
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
 *         description: Number of admins per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["Active", "Suspended"]
 *         description: Optional filter by admin status
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         description: Optional filter by admin role ID
 *     responses:
 *       200:
 *         description: A paginated list of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "john.doe@example.com"
 *                       role:
 *                         type: string
 *                         example: "Moderator"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                       phone:
 *                         type: string
 *                         example: "+201000458752"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-08-27T18:30:00.000Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error: Internal Server Error"
 */


/**
 * @swagger
 * /admins/role:
 *   get:
 *     summary: Get all admin roles
 *     description: Retrieve a list of all roles available for admins.
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: A list of admin roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       role:
 *                         type: string
 *                         example: "Super Admin"
 *       500:
 *         description: Server error
 */

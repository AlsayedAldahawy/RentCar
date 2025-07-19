/**
 * @swagger
 * /verify/admin-verify:
 *   put:
 *     tags:
 *       - Admin Verification
 *     summary: Verify a user or company account manually by an admin.
 *     description: Accessible only to users with role 'superadmin' or 'moderator'. Verifies a specific user or company by email.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: company@example.com
 *               role:
 *                 type: string
 *                 enum: [user, company]
 *                 example: company
 *     responses:
 *       200:
 *         description: Account verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: company is verified successfully
 *       400:
 *         description: Invalid role value or request.
 *       403:
 *         description: Unauthorized access (not an admin).
 *       404:
 *         description: Account not found.
 *       500:
 *         description: Server error.
 */

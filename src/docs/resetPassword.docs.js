/**
 * @swagger
 * /reset/user:
 *   post:
 *     summary: Reset password using token and email
 *     description: Resets the user's password using a valid reset token and email.
 *     tags: [Reset Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *                 description: The password reset token sent via email.
 *               newPassword:
 *                 type: string
 *                 description: The new password to be set.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email associated with the account.
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password has been reset successfully
 *       400:
 *         description: Invalid input or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token has expired
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

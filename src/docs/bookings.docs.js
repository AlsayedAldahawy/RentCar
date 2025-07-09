/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - car_id
 *               - start_date
 *               - end_date
 *             properties:
 *               car_id:
 *                 type: integer
 *                 example: 1
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-15"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-18"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad request or conflict
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /bookings/user:
 *   get:
 *     summary: Get all bookings for the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       car_id:
 *                         type: integer
 *                       car_name:
 *                         type: string
 *                       model:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: pending
 */


/**
 * @swagger
 * /bookings/company:
 *   get:
 *     summary: Get all bookings for the logged-in company
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings for the company cars
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       user_name:
 *                         type: string
 *                       car_name:
 *                         type: string
 *                       model:
 *                         type: string
 *                       status:
 *                         type: string
 *                         example: confirmed
 */



/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking (by user or company)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update booking dates
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_date
 *               - end_date
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-04"
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Invalid data or date conflict
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update the status of a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, rejected, completed]
 *                 example: confirmed
 *     responses:
 *       200:
 *         description: Booking status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booking status updated to confirmed
 *       400:
 *         description: Invalid status value
 *       403:
 *         description: Not authorized to change this status
 *       404:
 *         description: Booking not found
 */

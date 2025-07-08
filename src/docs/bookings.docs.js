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
 *     summary: Get all bookings made by the logged-in user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bookings/company:
 *   get:
 *     summary: Get all bookings made on company cars
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings on the company's cars
 *       401:
 *         description: Unauthorized
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

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars with optional filters and pagination
 *     tags: [Cars]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *           enum: [manual, automatic]
 *         description: Filter by transmission type
 *       - in: query
 *         name: fuel_type
 *         schema:
 *           type: string
 *           enum: [petrol, diesel, electric, hybrid]
 *         description: Filter by fuel type
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Minimum car capacity
 *       - in: query
 *         name: available
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 1 for available cars only, 0 for unavailable
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum daily rental price
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum daily rental price
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by car name (partial match)
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Search by car model (partial match)
 *     responses:
 *       200:
 *         description: List of filtered cars with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       model:
 *                         type: string
 *                       capacity:
 *                         type: integer
 *                       price_per_day:
 *                         type: number
 *                       transmission:
 *                         type: string
 *                       fuel_type:
 *                         type: string
 *                       mileage:
 *                         type: integer
 *                       color:
 *                         type: string
 *                       license_plate:
 *                         type: string
 *                       insurance_expiry:
 *                         type: string
 *                         format: date
 *                       image_url:
 *                         type: string
 *                       available:
 *                         type: integer
 *                       city:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       company_phone:
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
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cars/company/{companyId}:
 *   get:
 *     summary: Get all cars of a specific company with optional filters and pagination
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the company
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *           enum: [manual, automatic]
 *         description: Filter by transmission type
 *       - in: query
 *         name: fuel_type
 *         schema:
 *           type: string
 *           enum: [petrol, diesel, electric, hybrid]
 *         description: Filter by fuel type
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Minimum capacity
 *       - in: query
 *         name: available
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 1 = available, 0 = not available
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum daily price
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum daily price
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search by car name (partial match)
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *         description: Search by car model (partial match)
 *     responses:
 *       200:
 *         description: List of cars for the specified company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cars:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       model:
 *                         type: string
 *                       price_per_day:
 *                         type: number
 *                       fuel_type:
 *                         type: string
 *                       transmission:
 *                         type: string
 *                       available:
 *                         type: integer
 *                       city:
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
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Add a new car
 *     tags: [Cars]
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
 *               model:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               price_per_day:
 *                 type: number
 *               transmission:
 *                 type: string
 *                 enum: [automatic, manual]
 *               fuel_type:
 *                 type: string
 *                 enum: [petrol, diesel, electric, hybrid]
 *               mileage:
 *                 type: integer
 *               color:
 *                 type: string
 *               license_plate:
 *                 type: string
 *               insurance_expiry:
 *                 type: string
 *                 format: date
 *               image_url:
 *                 type: string
 *               description:
 *                 type: string
 *               city:
 *                 type: string
 *             required: [name, model, price_per_day, fuel_type, city]
 *     responses:
 *       201:
 *         description: Car added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update a car (only accessible by the company that owns it)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Car ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               model: { type: string }
 *               capacity: { type: integer }
 *               price_per_day: { type: number }
 *               transmission: { type: string, enum: [manual, automatic] }
 *               fuel_type: { type: string, enum: [petrol, diesel, electric, hybrid] }
 *               mileage: { type: integer }
 *               color: { type: string }
 *               license_plate: { type: string }
 *               insurance_expiry: { type: string, format: date }
 *               image_url: { type: string }
 *               description: { type: string }
 *               available: { type: boolean }
 *               city: { type: string }
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       403:
 *         description: Not allowed to update this car
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car (only accessible by the company that owns it)
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Car ID to delete
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       403:
 *         description: Not allowed to delete this car
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cars/company:
 *   get:
 *     summary: Get all cars owned by the logged-in company
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cars owned by the company
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get car by ID
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Car ID
 *     responses:
 *       200:
 *         description: Car details retrieved
 *       404:
 *         description: Car not found
 */


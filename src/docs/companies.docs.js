
// POST:Register
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


// POST:add-company
/**
 * @swagger
 * /companies/add-company:
 *   post:
 *     summary: Add a new company
 *     description: Add a new company by an admin (superadmin or moderator) with a randomly generated password sent via email.
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - status
 *               - address
 *               - cityId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Morocco RentCar Company"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "company@example.com"
 *               phone:
 *                 type: string
 *                 example: "+212600000000"
 *               status:
 *                 type: string
 *                 enum: ["active","inactive","pending","suspended","deleted","rejected"]
 *                 example: "pending"
 *               address:
 *                 type: string
 *                 example: "123 Morocco Street"
 *               cityId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Company registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company registered successfully"
 *       400:
 *         description: Email already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email already exists"
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


// POST:Login
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

// GET:profile
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
 *                     profilePic:
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


// GET:id (Public view)
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
 *                     profilePic:
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
 * /companies/admin/{id}:
 *   get:
 *     summary: Get company details by ID (Admins only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 company:
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
 *                     profilePic:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     region:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     is_verified:
 *                       type: boolean
 *                     status:
 *                       type: string
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (only admins can access this endpoint)
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */

// GET: /companies
/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get companies (with pagination and filters)
 *     description: >
 *       - **Admin users** get detailed info about companies (city, region, status, verification, etc).  
 *       - **Normal users** get limited company info (no sensitive fields).
 *     tags:
 *       - Companies
 *     parameters:
 *       - in: query
 *         name: cityId
 *         schema:
 *           type: integer
 *         description: Filter companies by city ID
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: integer
 *         description: Filter companies by region ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending, suspended, deleted, rejected]
 *         description: Filter companies by status
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Search companies by name (partial match)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           example: 0
 *         description: Number of records to skip (for pagination)
 *
 *     responses:
 *       200:
 *         description: List of companies (admin or user view depending on role)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 rows:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - type: object
 *                         description: Admin response
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Alex Cars"
 *                           email:
 *                             type: string
 *                             example: "info@alexcars.com"
 *                           phone:
 *                             type: string
 *                             example: "+20123456789"
 *                           profilePic:
 *                             type: string
 *                             example: "uploads/company1.png"
 *                           address:
 *                             type: string
 *                             example: "123 Main Street"
 *                           city:
 *                             type: string
 *                             example: "Cairo"
 *                           region:
 *                             type: string
 *                             example: "Giza"
 *                           createdAs:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-29T10:15:30Z"
 *                           isVerified:
 *                             type: boolean
 *                             example: true
 *                           status:
 *                             type: string
 *                             enum: [active, inactive, pending, suspended, deleted, rejected]
 *                             example: "active"
 *                       - type: object
 *                         description: Normal user response
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Alex Cars"
 *                           email:
 *                             type: string
 *                             example: "info@alexcars.com"
 *                           phone:
 *                             type: string
 *                             example: "+20123456789"
 *                           profilePic:
 *                             type: string
 *                             example: "uploads/company1.png"
 *
 *       500:
 *         description: Server error
 */

// PUT: change company's status (By Admin)
/**
 * @swagger
 * /companies/status/{id}:
 *   put:
 *     summary: Update a company's status (Admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending, suspended, deleted, rejected]
 *             example:
 *               status: "active"
 *     responses:
 *       200:
 *         description: Company's status updated successfully
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only admins allowed
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */

// PUT: verify company (By Admin)
/**
 * @swagger
 * /companies/verify/{id}:
 *   put:
 *     summary: Verify/unverify a company (Admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verify:
 *                 type: boolean
 *             example:
 *               verify: true
 *     responses:
 *       200:
 *         description: Company's verification status updated successfully
 *       400:
 *         description: Invalid value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only admins allowed
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */

// DELETE: Delete company (By Admin)

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

// Put:id (update company by admin)
/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update company profile by ID (Admin only)
 *     description: This API allows an admin to update the profile of a company. The admin can modify fields like name, email, phone, profile picture, address, and city.
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []  # Assuming Bearer Token Authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the company to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the company.
 *                 example: "Tech Solutions"
 *               email:
 *                 type: string
 *                 description: Email address of the company.
 *                 example: "contact@techsolutions.com"
 *               phone:
 *                 type: string
 *                 description: Phone number of the company.
 *                 example: "+201234567890"
 *               profilePic:
 *                 type: string
 *                 description: URL of the company profile picture.
 *                 example: "https://example.com/profile-pic.jpg"
 *               address:
 *                 type: string
 *                 description: Address of the company.
 *                 example: "123 Tech Street, Cairo"
 *               cityId:
 *                 type: integer
 *                 description: ID of the city where the company is located.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Company profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Your profile updated successfully"
 *                 companyId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request, invalid input data or company not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Company not found"
 *       403:
 *         description: Forbidden, only admins can update company profiles.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only company can update their profile"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error: <error details>"
 */


// PUT: profile (Update by company)
/**
 * @swagger
 * /companies/profile:
 *   put:
 *     summary: Update company profile information
 *     description: This API allows a company to update its profile details, such as name, phone, email, address, and city.
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []  # Assuming you are using Bearer Token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the company.
 *                 example: "Tech Solutions"
 *               email:
 *                 type: string
 *                 description: Email of the company.
 *                 example: "contact@techsolutions.com"
 *               phone:
 *                 type: string
 *                 description: Phone number of the company.
 *                 example: "+201234567890"
 *               profilePic:
 *                 type: string
 *                 description: URL of the company's profile picture.
 *                 example: "https://example.com/profile-pic.jpg"
 *               address:
 *                 type: string
 *                 description: Address of the company.
 *                 example: "123 Tech Street, Cairo"
 *               cityId:
 *                 type: integer
 *                 description: City ID where the company is located.
 *                 example: 3
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Your profile updated successfully"
 *                 companyId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request, either due to missing or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Company not found"
 *       403:
 *         description: Forbidden, if the user is not a company.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only company can update their profile"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server error: <error details>"
 */

// Post: Reset password
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

// Post: update password
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

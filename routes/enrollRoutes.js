const express = require('express');

const {
	createEnrollment,
	getAllEnrollments,
	getEnrollmentById,
	updateEnrollment,
	unenrollFromCourse,
} = require('../controllers/enrollController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createEnrollment).get(getAllEnrollments);
router.route('/:id').get(getEnrollmentById).put(updateEnrollment).delete(unenrollFromCourse);

module.exports = router;
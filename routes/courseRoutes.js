const express = require('express');

const {
	getCoursesByInstructor,
	createCourse,
	getAllCourses,
	getCourseById,
	updateCourse,
	deleteCourse,
} = require('../controllers/courseController');

const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/instructor/:id', getCoursesByInstructor);

router.route('/').post(protect, createCourse).get(getAllCourses);
router.route('/:id').get(getCourseById).put(protect, updateCourse).delete(protect, deleteCourse);

module.exports = router;
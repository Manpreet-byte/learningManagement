const express = require('express');

const { getStudentCourses } = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id/courses', protect, getStudentCourses);

module.exports = router;
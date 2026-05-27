const Enrollment = require('../models/Enrollment');

const getStudentCourses = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Not authorized to view these courses' });
    }

    const enrollments = await Enrollment.find({ student: id })
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name email role',
        },
      })
      .populate('student', 'name email role');

    const courses = enrollments.map((enrollment) => enrollment.course).filter(Boolean);

    return res.status(200).json({
      count: courses.length,
      studentId: id,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentCourses,
};
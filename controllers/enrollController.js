const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

const populateEnrollment = (query) =>
  query
    .populate('student', 'name email role')
    .populate({
      path: 'course',
      populate: {
        path: 'instructor',
        select: 'name email role',
      },
    });

const canManageEnrollment = (user, enrollment) => {
  if (!enrollment || !enrollment.course || !enrollment.student) return false;
  const isEnrolledStudent = enrollment.student._id.toString() === user.id;
  const isCourseInstructor = enrollment.course.instructor?._id?.toString() === user.id;
  return isEnrolledStudent || isCourseInstructor;
};

const createEnrollment = async (req, res, next) => {
  try {
    const { course: courseId, student: studentId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const targetStudentId = studentId || req.user.id;
    if (targetStudentId !== req.user.id && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to enroll this student' });
    }

    const existing = await Enrollment.findOne({ student: targetStudentId, course: courseId });
    if (existing) {
      return res.status(409).json({ message: 'Student is already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: targetStudentId,
      course: courseId,
    });

    const populated = await populateEnrollment(Enrollment.findById(enrollment._id));

    return res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment: populated,
    });
  } catch (error) {
    next(error);
  }
};

const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await populateEnrollment(Enrollment.find().sort({ createdAt: -1 }));

    const visibleEnrollments = enrollments.filter((enrollment) => canManageEnrollment(req.user, enrollment));

    return res.status(200).json({
      count: visibleEnrollments.length,
      enrollments: visibleEnrollments,
    });
  } catch (error) {
    next(error);
  }
};

const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await populateEnrollment(Enrollment.findById(id));

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!canManageEnrollment(req.user, enrollment)) {
      return res.status(403).json({ message: 'Not authorized to view this enrollment' });
    }

    return res.status(200).json({ enrollment });
  } catch (error) {
    next(error);
  }
};

const updateEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { course: nextCourseId, student: nextStudentId } = req.body;

    const enrollment = await populateEnrollment(Enrollment.findById(id));

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!canManageEnrollment(req.user, enrollment)) {
      return res.status(403).json({ message: 'Not authorized to update this enrollment' });
    }

    let targetCourseId = enrollment.course._id.toString();
    if (nextCourseId) {
      const nextCourse = await Course.findById(nextCourseId);
      if (!nextCourse) {
        return res.status(404).json({ message: 'Target course not found' });
      }
      targetCourseId = nextCourse._id.toString();
    }

    const targetStudentId = nextStudentId || enrollment.student._id.toString();

    const duplicate = await Enrollment.findOne({
      _id: { $ne: id },
      student: targetStudentId,
      course: targetCourseId,
    });

    if (duplicate) {
      return res.status(409).json({ message: 'Enrollment already exists for this student and course' });
    }

    enrollment.student = targetStudentId;
    enrollment.course = targetCourseId;
    await enrollment.save();

    const populated = await populateEnrollment(Enrollment.findById(id));

    return res.status(200).json({
      message: 'Enrollment updated successfully',
      enrollment: populated,
    });
  } catch (error) {
    next(error);
  }
};

const unenrollFromCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await populateEnrollment(Enrollment.findById(id));

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!canManageEnrollment(req.user, enrollment)) {
      return res.status(403).json({ message: 'Not authorized to delete this enrollment' });
    }

    await Enrollment.findByIdAndDelete(id);

    return res.status(200).json({
      message: 'Student unenrolled successfully',
      removedEnrollment: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  unenrollFromCourse,
};
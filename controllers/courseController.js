const Course = require('../models/Course');

const getCoursesByInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const courses = await Course.find({ instructor: id }).populate('instructor', 'name email role');

    return res.status(200).json({
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const course = await Course.create({ title, description, instructor: req.user.id });
    const populated = await course.populate('instructor', 'name email role');
    return res.status(201).json({ message: 'Course created', course: populated });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email role').sort({ createdAt: -1 });
    return res.status(200).json({ count: courses.length, courses });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email role');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to update this course' });

    course.title = req.body.title ?? course.title;
    course.description = req.body.description ?? course.description;
    await course.save();
    const populated = await course.populate('instructor', 'name email role');
    return res.status(200).json({ message: 'Course updated', course: populated });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to delete this course' });

    await Course.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoursesByInstructor,
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
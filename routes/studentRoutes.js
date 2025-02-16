const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new student
router.post('/', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.name || !req.body.email || !req.body.course) {
      return res.status(400).json({ error: 'Missing required fields: name, email, course' });
    }

    // Create a new student
    const student = new Student({
      name: req.body.name,
      email: req.body.email,
      course: req.body.course
    });

    // Save the student to the database
    await student.save();

    // Send success response
    res.status(201).json(student);
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: errors });
    }

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Handle other errors
    res.status(500).json({ error: err.message });
  }
});

// Update a student by ID
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: errors });
    }

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Handle other errors
    res.status(500).json({ error: err.message });
  }
});

// Delete a student by ID
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../../middleware/validate.js';
import { protect } from '../auth/auth.middleware.js';
import {
  getJobsController,
  createJobController,
  getMyPostsController,
  getSavedJobsController,
  getMyApplicationsController,
  getJobByIdController,
  updateJobController,
  deleteJobController,
  toggleJobStatusController,
  toggleSaveJobController,
  applyToJobController,
  getApplicantsController,
  updateApplicationStatusController,
} from './jobs.controller.js';

const router = Router();

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const WORKPLACES = ['onsite', 'hybrid', 'remote'];

const createJobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required').isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('companyName').trim().notEmpty().withMessage('Company name is required').isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType').isIn(JOB_TYPES).withMessage('Invalid job type'),
  body('workplace').isIn(WORKPLACES).withMessage('Invalid workplace'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('requirements').optional().isLength({ max: 3000 }).withMessage('Requirements cannot exceed 3000 characters'),
];

const updateJobValidation = [
  body('title').optional().trim().notEmpty().withMessage('Job title cannot be empty').isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty').isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('jobType').optional().isIn(JOB_TYPES).withMessage('Invalid job type'),
  body('workplace').optional().isIn(WORKPLACES).withMessage('Invalid workplace'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty').isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('requirements').optional().isLength({ max: 3000 }).withMessage('Requirements cannot exceed 3000 characters'),
];

const applyValidation = [
  body('coverLetter').optional().isLength({ max: 2000 }).withMessage('Cover letter cannot exceed 2000 characters'),
];

const applicationStatusValidation = [
  body('status').isIn(['viewed', 'rejected', 'accepted']).withMessage('Invalid application status'),
];

// Static routes must precede the "/:id" param route so they are not shadowed.
router.get('/', protect, getJobsController);
router.post('/', protect, createJobValidation, validate, createJobController);
router.get('/my-posts', protect, getMyPostsController);
router.get('/saved', protect, getSavedJobsController);
router.get('/my-applications', protect, getMyApplicationsController);

router.get('/:id', protect, getJobByIdController);
router.patch('/:id', protect, updateJobValidation, validate, updateJobController);
router.delete('/:id', protect, deleteJobController);
router.patch('/:id/close', protect, toggleJobStatusController);
router.patch('/:id/save', protect, toggleSaveJobController);

router.post('/:id/apply', protect, applyValidation, validate, applyToJobController);
router.get('/:id/applicants', protect, getApplicantsController);
router.patch('/:id/applicants/:applicationId', protect, applicationStatusValidation, validate, updateApplicationStatusController);

export default router;

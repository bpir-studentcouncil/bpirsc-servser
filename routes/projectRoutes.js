import express from 'express';
import { dbClient } from '../utils/dbClient.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await dbClient.projects.countDocuments();
    const completed = await dbClient.projects.countDocuments({ status: 'Completed' });
    const ongoing = await dbClient.projects.countDocuments({ status: 'Ongoing' });
    const upcoming = await dbClient.projects.countDocuments({ status: 'Upcoming' });

    res.json({ total, completed, ongoing, upcoming });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    res.status(500).json({ message: 'Error fetching project stats' });
  }
});

// Get all projects, with filters
router.get('/', async (req, res) => {
  const { status, type, search, featured } = req.query;

  try {
    let projectList = await dbClient.projects.find();

    if (featured === 'true') {
      projectList = projectList.filter(p => p.isFeatured === true);
    }
    if (status) {
      projectList = projectList.filter(p => p.status === status);
    }
    if (type) {
      projectList = projectList.filter(p => p.projectType === type);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      projectList = projectList.filter(p => 
        p.title.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower)
      );
    }

    res.json(projectList);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects list' });
  }
});

// Get single project details
router.get('/:id', async (req, res) => {
  try {
    const project = await dbClient.projects.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({ message: 'Error fetching project details' });
  }
});

// Admin Only: Add Project
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  const { 
    title, description, coverImage, gallery, 
    startDate, endDate, status, projectType, 
    teamMembers, challenges, outcomes, isFeatured 
  } = req.body;

  if (!title || !description || !projectType) {
    return res.status(400).json({ message: 'Title, description and project type are required' });
  }

  try {
    const project = await dbClient.projects.create({
      title,
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      gallery: gallery || [],
      startDate,
      endDate,
      status: status || 'Ongoing',
      projectType,
      teamMembers: teamMembers || [],
      challenges: challenges || '',
      outcomes: outcomes || '',
      isFeatured: isFeatured === true || isFeatured === 'true',
      createdAt: new Date()
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Admin Only: Edit Project
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { 
    title, description, coverImage, gallery, 
    startDate, endDate, status, projectType, 
    teamMembers, challenges, outcomes, isFeatured 
  } = req.body;

  try {
    const updatedProject = await dbClient.projects.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        coverImage,
        gallery,
        startDate,
        endDate,
        status,
        projectType,
        teamMembers,
        challenges,
        outcomes,
        isFeatured: isFeatured === true || isFeatured === 'true'
      },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project' });
  }
});

// Admin Only: Delete Project
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const deletedProject = await dbClient.projects.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
});

export default router;

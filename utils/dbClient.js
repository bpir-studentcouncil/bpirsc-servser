import 'dotenv/config';
import fs from 'fs';

import path from 'path';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Alumni from '../models/Alumni.js';
import News from '../models/News.js';
import Project from '../models/Project.js';
import Contact from '../models/Contact.js';
import TeamMember from '../models/TeamMember.js';


// Setup directories for Mock JSON storage
const __dirname = path.resolve();
const MOCK_DIR = path.join(__dirname, 'mock_data');
if (!fs.existsSync(MOCK_DIR)) {
  fs.mkdirSync(MOCK_DIR, { recursive: true });
}

const getFilePath = (fileName) => path.join(MOCK_DIR, fileName);

const readMockData = (fileName, defaultData = []) => {
  const filePath = getFilePath(fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading mock data file ${fileName}:`, err);
    return defaultData;
  }
};

const writeMockData = (fileName, data) => {
  const filePath = getFilePath(fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing mock data file ${fileName}:`, err);
  }
};

// Seed mock data if files are empty
const seedMockData = () => {
  const newsFile = 'news.json';
  if (readMockData(newsFile).length === 0) {
    writeMockData(newsFile, [
      {
        _id: 'news_1',
        title: 'BPIRSC Organizing AutoCAD Fundamental Workshop',
        content: 'We are excited to announce our upcoming hands-on workshop on AutoCAD fundamentals. This workshop is designed for architecture and engineering students who want to kickstart their designing journey. Register online by next Monday!',
        category: 'Technical Education News',
        coverImage: 'https://images.unsplash.com/photo-1581092334247-433a9255628a?auto=format&fit=crop&w=800&q=80',
        authorName: 'Rashedul Islam',
        authorRole: 'Admin',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isFeatured: true
      },
      {
        _id: 'news_2',
        title: 'Scholarship Opportunities for Polytechnic Students in Japan',
        content: 'MEXT Japan offers scholarship programs for diploma engineering students. Find the list of eligible fields, language prerequisites, and submission steps inside. Application closes on July 30.',
        category: 'Scholarship Information',
        coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
        authorName: 'Dr. M. A. Rahman',
        authorRole: 'Alumni',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isFeatured: false
      },
      {
        _id: 'news_3',
        title: 'Academic Notice: Midterm Exam Schedule Released',
        content: 'Official notice from the BPIR Student Council academic section: Midterm examinations will commence from June 25, 2026. Please collect your admit card from the department office.',
        category: 'Notice Board',
        coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
        authorName: 'System Notice',
        authorRole: 'Admin',
        publishedAt: new Date().toISOString(),
        isFeatured: false
      }
    ]);
  }

  const projectsFile = 'projects.json';
  if (readMockData(projectsFile).length === 0) {
    writeMockData(projectsFile, [
      {
        _id: 'proj_1',
        title: 'Free AutoCAD Mastery Course',
        description: 'A 4-week certificate course aiming to cover 2D and 3D modeling fundamentals, rendering, and design layout practices.',
        coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1581092334247-433a9255628a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
        ],
        startDate: '2026-05-01',
        endDate: '2026-05-30',
        status: 'Completed',
        projectType: 'AutoCAD Course',
        teamMembers: [
          { name: 'Sabbir Ahmed', role: 'Lead Instructor' },
          { name: 'Nusrat Jahan', role: 'Coordinator' }
        ],
        challenges: 'Managing large lab sizes and limited licensing software setup.',
        outcomes: 'Over 120 students certified with practical skills in architectural mapping.',
        isFeatured: true
      },
      {
        _id: 'proj_2',
        title: 'Blood Donation Camp 2026',
        description: 'Voluntary blood drive organized in association with Sandhani Rajshahi Medical College, targeting polytechnic students.',
        coverImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
        gallery: [],
        startDate: '2026-06-10',
        endDate: '2026-06-11',
        status: 'Completed',
        projectType: 'Blood Donation Campaigns',
        teamMembers: [
          { name: 'Tanvir Hossain', role: 'Volunteer Lead' }
        ],
        challenges: 'Coordinating blood testing kits and maintaining hygiene protocols.',
        outcomes: 'Collected 75+ bags of blood to aid local hospital emergencies.',
        isFeatured: false
      },
      {
        _id: 'proj_3',
        title: 'Innovative Smart Home IoT Project',
        description: 'A collaborative hardware development project designing cost-effective IoT nodes for power management and smart switches.',
        coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
        gallery: [],
        startDate: '2026-06-01',
        endDate: '2026-07-15',
        status: 'Ongoing',
        projectType: 'Technical Workshops',
        teamMembers: [
          { name: 'Fahim Faisal', role: 'IoT Architect' },
          { name: 'Rimi Sen', role: 'Embedded Developer' }
        ],
        challenges: 'High cost of specialized microcontrollers and sensors locally.',
        outcomes: 'Working prototype is 80% complete and will be showcased at the local science fair.',
        isFeatured: true
      }
    ]);
  }

  const usersFile = 'users.json';
  if (readMockData(usersFile).length === 0) {
    writeMockData(usersFile, [
      {
        _id: 'user_admin',
        uid: 'mock-uid-admin',
        email: 'admin@bpirsc.org',
        name: 'BPIRSC Executive Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_student',
        uid: 'mock-uid-student',
        email: 'student@bpirsc.org',
        name: 'Adnan Sami',
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'user_alumni',
        uid: 'mock-uid-alumni',
        email: 'alumni@bpirsc.org',
        name: 'Engr. Mahbubul Alam',
        role: 'alumni',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  const teamFile = 'team.json';
  if (readMockData(teamFile).length === 0) {
    writeMockData(teamFile, [
      {
        _id: 'team_1',
        name: "Engr. Monirul Islam",
        position: "Advisor & Mentor",
        dept: "Computer Technology",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
        bio: "Academic council chair with over 12 years of instructing polytechnic graduates on CAD drafting, networking, and industry practices.",
        social: { facebook: "https://facebook.com/monirul.islam.bpirsc", linkedin: "https://linkedin.com/in/monirul-islam-bpirsc", twitter: "" }
      },
      {
        _id: 'team_2',
        name: "Sabbir Ahmed",
        position: "President",
        dept: "Mechanical Technology",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
        bio: "Automations programmer and lead AutoCAD coordinator. Passionate about empowering students through code and hardware collaborations.",
        social: { facebook: "https://facebook.com/sabbir.ahmed.bpirsc", linkedin: "https://linkedin.com/in/sabbir-ahmed-bpirsc", twitter: "https://twitter.com/sabbir_bpirsc" }
      },
      {
        _id: 'team_3',
        name: "Nusrat Jahan",
        position: "General Secretary",
        dept: "Computer Technology",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80",
        bio: "Full Stack JavaScript developer. Manages administrative communications and organises quarterly tech seminars and blood campaigns.",
        social: { facebook: "https://facebook.com/nusrat.jahan.bpirsc", linkedin: "https://linkedin.com/in/nusrat-jahan-bpirsc", twitter: "" }
      },
      {
        _id: 'team_4',
        name: "Kamrul Hasan",
        position: "Alumni Coordinator",
        dept: "Civil Technology",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80",
        bio: "Site manager at a top local construction firm. Facilitates alumni referrals, job openings, and industrial placement programs.",
        social: { facebook: "", linkedin: "https://linkedin.com/in/kamrul-hasan-bpirsc", twitter: "" }
      }
    ]);
  }
};

// Mode configuration
export const isDemoMode = !process.env.MONGO_URI;

const seedMongoTeamData = async () => {
  try {
    const count = await TeamMember.countDocuments();
    if (count === 0) {
      await TeamMember.create([
        {
          name: 'Engr. Monirul Islam',
          position: 'Advisor & Mentor',
          dept: 'Computer Technology',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
          bio: 'Academic council chair with over 12 years of instructing polytechnic graduates on CAD drafting, networking, and industry practices.',
          social: { facebook: 'https://facebook.com/monirul.islam.bpirsc', linkedin: 'https://linkedin.com/in/monirul-islam-bpirsc', twitter: '' }
        },
        {
          name: 'Sabbir Ahmed',
          position: 'President',
          dept: 'Mechanical Technology',
          photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
          bio: 'Automations programmer and lead AutoCAD coordinator. Passionate about empowering students through code and hardware collaborations.',
          social: { facebook: 'https://facebook.com/sabbir.ahmed.bpirsc', linkedin: 'https://linkedin.com/in/sabbir-ahmed-bpirsc', twitter: 'https://twitter.com/sabbir_bpirsc' }
        },
        {
          name: 'Nusrat Jahan',
          position: 'General Secretary',
          dept: 'Computer Technology',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
          bio: 'Full Stack JavaScript developer. Manages administrative communications and organises quarterly tech seminars and blood campaigns.',
          social: { facebook: 'https://facebook.com/nusrat.jahan.bpirsc', linkedin: 'https://linkedin.com/in/nusrat-jahan-bpirsc', twitter: '' }
        },
        {
          name: 'Kamrul Hasan',
          position: 'Alumni Coordinator',
          dept: 'Civil Technology',
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
          bio: 'Site manager at a top local construction firm. Facilitates alumni referrals, job openings, and industrial placement programs.',
          social: { facebook: '', linkedin: 'https://linkedin.com/in/kamrul-hasan-bpirsc', twitter: '' }
        }
      ]);
      console.log('🌱 Seeded default team members in MongoDB.');
    }
  } catch (err) {
    console.error('Failed to seed MongoDB team members:', err);
  }
};

const seedMongoNewsData = async () => {
  try {
    const count = await News.countDocuments();
    if (count === 0) {
      await News.create([
        {
          title: 'BPIRSC Organizing AutoCAD Fundamental Workshop',
          content: 'We are excited to announce our upcoming hands-on workshop on AutoCAD fundamentals. This workshop is designed for architecture and engineering students who want to kickstart their designing journey. Register online by next Monday!',
          category: 'Technical Education News',
          coverImage: 'https://images.unsplash.com/photo-1581092334247-433a9255628a?auto=format&fit=crop&w=800&q=80',
          authorName: 'Rashedul Islam',
          authorRole: 'Admin',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isFeatured: true
        },
        {
          title: 'Scholarship Opportunities for Polytechnic Students in Japan',
          content: 'MEXT Japan offers scholarship programs for diploma engineering students. Find the list of eligible fields, language prerequisites, and submission steps inside. Application closes on July 30.',
          category: 'Scholarship Information',
          coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
          authorName: 'Dr. M. A. Rahman',
          authorRole: 'Alumni',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isFeatured: false
        },
        {
          title: 'Academic Notice: Midterm Exam Schedule Released',
          content: 'Official notice from the BPIR Student Council academic section: Midterm examinations will commence from June 25, 2026. Please collect your admit card from the department office.',
          category: 'Notice Board',
          coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
          authorName: 'System Notice',
          authorRole: 'Admin',
          publishedAt: new Date(),
          isFeatured: false
        }
      ]);
      console.log('🌱 Seeded default news in MongoDB.');
    }
  } catch (err) {
    console.error('Failed to seed MongoDB news:', err);
  }
};

const seedMongoProjectsData = async () => {
  try {
    const count = await Project.countDocuments();
    if (count === 0) {
      await Project.create([
        {
          title: 'Free AutoCAD Mastery Course',
          description: 'A 4-week certificate course aiming to cover 2D and 3D modeling fundamentals, rendering, and design layout practices.',
          coverImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1581092334247-433a9255628a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
          ],
          startDate: new Date('2026-05-01'),
          endDate: new Date('2026-05-30'),
          status: 'Completed',
          projectType: 'AutoCAD Course',
          teamMembers: [
            { name: 'Sabbir Ahmed', role: 'Lead Instructor' },
            { name: 'Nusrat Jahan', role: 'Coordinator' }
          ],
          challenges: 'Managing large lab sizes and limited licensing software setup.',
          outcomes: 'Over 120 students certified with practical skills in architectural mapping.',
          isFeatured: true
        },
        {
          title: 'Blood Donation Camp 2026',
          description: 'Voluntary blood drive organized in association with Sandhani Rajshahi Medical College, targeting polytechnic students.',
          coverImage: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=800&q=80',
          gallery: [],
          startDate: new Date('2026-06-10'),
          endDate: new Date('2026-06-11'),
          status: 'Completed',
          projectType: 'Blood Donation Campaigns',
          teamMembers: [
            { name: 'Tanvir Hossain', role: 'Volunteer Lead' }
          ],
          challenges: 'Coordinating blood testing kits and maintaining hygiene protocols.',
          outcomes: 'Collected 75+ bags of blood to aid local hospital emergencies.',
          isFeatured: false
        },
        {
          title: 'Innovative Smart Home IoT Project',
          description: 'A collaborative hardware development project designing cost-effective IoT nodes for power management and smart switches.',
          coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
          gallery: [],
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-07-15'),
          status: 'Ongoing',
          projectType: 'Technical Workshops',
          teamMembers: [
            { name: 'Fahim Faisal', role: 'IoT Architect' },
            { name: 'Rimi Sen', role: 'Embedded Developer' }
          ],
          challenges: 'High cost of specialized microcontrollers and sensors locally.',
          outcomes: 'Working prototype is 80% complete and will be showcased at the local science fair.',
          isFeatured: true
        }
      ]);
      console.log('🌱 Seeded default projects in MongoDB.');
    }
  } catch (err) {
    console.error('Failed to seed MongoDB projects:', err);
  }
};

export const connectDB = async () => {
  if (isDemoMode) {
    console.log('⚠️  MONGO_URI not specified. Running server in DEMO MODE with local JSON storage.');
    seedMockData();
    return true;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('⚡ Connected to MongoDB Atlas successfully.');
    await seedMongoTeamData();
    await seedMongoNewsData();
    await seedMongoProjectsData();
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('🔄 Falling back to DEMO MODE with local JSON storage.');
    seedMockData();
    return false;
  }
};

// Helper mock operations generator
const createMockOps = (fileName) => {
  return {
    find: async (query = {}) => {
      const data = readMockData(fileName);
      return data.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    },
    findOne: async (query = {}) => {
      const data = readMockData(fileName);
      return data.find(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }) || null;
    },
    findById: async (id) => {
      const data = readMockData(fileName);
      return data.find(item => item._id === id || item.id === id) || null;
    },
    create: async (body) => {
      const data = readMockData(fileName);
      const newObj = {
        _id: Math.random().toString(36).substr(2, 9),
        ...body,
        createdAt: new Date().toISOString()
      };
      data.push(newObj);
      writeMockData(fileName, data);
      return newObj;
    },
    findByIdAndUpdate: async (id, updates, options = {}) => {
      const data = readMockData(fileName);
      const index = data.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      data[index] = { ...data[index], ...updates };
      writeMockData(fileName, data);
      return data[index];
    },
    findByIdAndDelete: async (id) => {
      const data = readMockData(fileName);
      const index = data.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      const deleted = data.splice(index, 1)[0];
      writeMockData(fileName, data);
      return deleted;
    },
    deleteOne: async (query = {}) => {
      const data = readMockData(fileName);
      const index = data.findIndex(item => {
        for (let key in query) {
          if (item[key] !== query[key]) return false;
        }
        return true;
      });
      if (index === -1) return { deletedCount: 0 };
      data.splice(index, 1);
      writeMockData(fileName, data);
      return { deletedCount: 1 };
    },
    countDocuments: async (query = {}) => {
      const data = readMockData(fileName);
      if (Object.keys(query).length === 0) return data.length;
      return data.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }).length;
    }
  };
};

// Exportable DB clients
export const dbClient = {
  users: !isDemoMode ? {
    find: (q) => User.find(q),
    findOne: (q) => User.findOne(q),
    findById: (id) => User.findById(id),
    create: (body) => User.create(body),
    findByIdAndUpdate: (id, up, opt) => User.findByIdAndUpdate(id, up, { new: true, ...opt }),
    findByIdAndDelete: (id) => User.findByIdAndDelete(id),
    deleteOne: (q) => User.deleteOne(q),
    countDocuments: (q) => User.countDocuments(q)
  } : createMockOps('users.json'),

  alumni: !isDemoMode ? {
    find: (q) => Alumni.find(q),
    findOne: (q) => Alumni.findOne(q),
    findById: (id) => Alumni.findById(id),
    create: (body) => Alumni.create(body),
    findByIdAndUpdate: (id, up, opt) => Alumni.findByIdAndUpdate(id, up, { new: true, ...opt }),
    findByIdAndDelete: (id) => Alumni.findByIdAndDelete(id),
    deleteOne: (q) => Alumni.deleteOne(q),
    countDocuments: (q) => Alumni.countDocuments(q)
  } : createMockOps('alumni.json'),

  news: !isDemoMode ? {
    find: (q) => News.find(q).sort({ publishedAt: -1 }),
    findOne: (q) => News.findOne(q),
    findById: (id) => News.findById(id),
    create: (body) => News.create(body),
    findByIdAndUpdate: (id, up, opt) => News.findByIdAndUpdate(id, up, { new: true, ...opt }),
    findByIdAndDelete: (id) => News.findByIdAndDelete(id),
    deleteOne: (q) => News.deleteOne(q),
    countDocuments: (q) => News.countDocuments(q)
  } : createMockOps('news.json'),

  projects: !isDemoMode ? {
    find: (q) => Project.find(q).sort({ startDate: -1 }),
    findOne: (q) => Project.findOne(q),
    findById: (id) => Project.findById(id),
    create: (body) => Project.create(body),
    findByIdAndUpdate: (id, up, opt) => Project.findByIdAndUpdate(id, up, { new: true, ...opt }),
    findByIdAndDelete: (id) => Project.findByIdAndDelete(id),
    deleteOne: (q) => Project.deleteOne(q),
    countDocuments: (q) => Project.countDocuments(q)
  } : createMockOps('projects.json'),

  contacts: !isDemoMode ? {
    find: (q) => Contact.find(q).sort({ createdAt: -1 }),
    findOne: (q) => Contact.findOne(q),
    findById: (id) => Contact.findById(id),
    create: (body) => Contact.create(body),
    findByIdAndUpdate: (id, up, opt) => Contact.findByIdAndUpdate(id, up, { new: true, ...opt }),
    findByIdAndDelete: (id) => Contact.findByIdAndDelete(id),
    deleteOne: (q) => Contact.deleteOne(q),
    countDocuments: (q) => Contact.countDocuments(q)
  } : createMockOps('contacts.json'),

  teamMembers: !isDemoMode ? {
    find: (q) => TeamMember.find(q).sort({ createdAt: 1 }),
    findOne: (q) => TeamMember.findOne(q),
    findById: (id) => TeamMember.findById(id),
    create: (body) => TeamMember.create(body),
    findByIdAndUpdate: (id, up, opt) => TeamMember.findByIdAndUpdate(id, up, { new: true, ...opt }),
    findByIdAndDelete: (id) => TeamMember.findByIdAndDelete(id),
    deleteOne: (q) => TeamMember.deleteOne(q),
    countDocuments: (q) => TeamMember.countDocuments(q)
  } : createMockOps('team.json')
};

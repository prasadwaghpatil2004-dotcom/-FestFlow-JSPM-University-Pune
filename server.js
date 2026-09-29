/**
 * ============================================================================
 * FESTFLOW - CAMPUS EVENT DISCOVERY & TAG-INTERSECTION MATCHING ENGINE
 * ============================================================================
 * File: server.js
 * Stack: Node.js, Express, Mongoose (MongoDB), CORS, Dotenv
 * Institution: JSPM University, Pune
 * ============================================================================
 */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables (.env)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// Server & Database Configuration
const PORT = Number(process.env.SERVER_PORT) || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/festflow';

// Standard Middleware Configuration
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static assets from 'public' directory if present
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// 1. MONGOOSE DATA MODELS
// ============================================================================

/**
 * Student Schema
 * Stores registered campus students, their university identity, and their
 * personal skill/interest tags used by the matching engine.
 */
const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Student email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please provide a valid email address'],
    },
    jspm_prn: {
      type: String,
      required: [true, 'JSPM Permanent Registration Number (PRN) is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department / Branch is required'],
      trim: true,
    },
    interest_tags: {
      type: [String],
      default: [],
      trim: true,
    },
    // Auxiliary profile fields for complete campus UX
    profile_image: {
      type: String,
      default: '',
    },
    year_of_study: {
      type: String,
      default: '2nd Year',
      trim: true,
    },
    graduation_year: {
      type: String,
      default: 'Class of 2028',
      trim: true,
    },
    registered_events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    completed_events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Search indexes for rapid query performance
StudentSchema.index({ jspm_prn: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ interest_tags: 1 });

/**
 * Event Schema
 * Stores campus events published by departments, clubs, and student societies.
 */
const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    organizing_department_or_club: {
      type: String,
      required: [true, 'Organizing department or club is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      trim: true,
    },
    registration_link: {
      type: String,
      required: [true, 'Registration URL or Google Form link is required'],
      trim: true,
    },
    // Auxiliary event metadata
    subcategory: {
      type: String,
      default: 'Campus Event',
      trim: true,
    },
    venue: {
      type: String,
      default: 'JSPM Central Auditorium',
      trim: true,
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
    contact_email: {
      type: String,
      default: 'events@jspm.edu.in',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for date sorting and tag intersections
EventSchema.index({ date: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ category: 1 });

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

// ============================================================================
// RESILIENT IN-MEMORY STORE (Fallback when local MongoDB is not yet running)
// ============================================================================
let isMongoConnected = false;

const initialSeedStudents = [
  {
    _id: '654321000000000000000001',
    name: 'Prasad Waghpatil',
    email: 'prasad.waghpatil@jspm.edu.in',
    jspm_prn: 'JSPM2023CS0142',
    department: 'B.Tech Computer Science & Engineering (CSE)',
    interest_tags: ['#Coding', '#WebDev', '#AI', '#Hackathon', '#Placements'],
    profile_image: '',
    year_of_study: '2nd Year',
    graduation_year: 'Class of 2028',
    registered_events: [],
    completed_events: [],
    createdAt: new Date(),
  },
];

const initialSeedEvents = [
  {
    _id: '654321000000000000000101',
    title: 'CypherHack 2026: 24-Hour Annual Codeathon',
    organizing_department_or_club: 'Cypher Coding Club (CSE)',
    category: 'Technical & Hackathons',
    subcategory: 'Coding Sprint',
    date: new Date('2026-10-15T09:30:00Z'),
    description: 'Flagship 24-hour hackathon of JSPM Pune. Build production prototypes with Generative AI, Cloud, and Web3. Mentorship from alumni working in top Pune tech hubs + cash prize pool of ₹50,000.',
    tags: ['#Coding', '#WebDev', '#AI', '#Hackathon', '#Python'],
    registration_link: 'https://devfolio.co/cypherhack-jspm-2026',
    venue: 'JSPM Computing Complex Lab 3 & Central Auditorium',
    isVirtual: false,
    contact_email: 'cypherclub@jspm.edu.in',
    status: 'active',
    createdAt: new Date(),
  },
  {
    _id: '654321000000000000000102',
    title: 'TPO Mega Core Software & IT Placement Drive',
    organizing_department_or_club: 'Training & Placement Cell (TPO JSPM)',
    category: 'Campus Placements & Internships',
    subcategory: 'Campus Recruitment',
    date: new Date('2026-10-18T08:30:00Z'),
    description: 'Pooled on-campus recruitment drive for 2026 graduating batch (B.Tech CSE/IT/MCA). Technical aptitude tests, live coding assessment rounds, and HR interviews.',
    tags: ['#Placements', '#Coding', '#WebDev', '#InterviewPrep', '#ResumeBuilding'],
    registration_link: 'https://forms.gle/jspm-tpo-placement-drive-2026',
    venue: 'TPO Seminar Hall & Interview Suites, Wagholi',
    isVirtual: false,
    contact_email: 'tpo@jspm.edu.in',
    status: 'active',
    createdAt: new Date(),
  },
  {
    _id: '654321000000000000000103',
    title: 'Autonomous Quadruped & Drone Robotics Expo',
    organizing_department_or_club: 'Robotics & Automation Society (RAS)',
    category: 'Technical & Hackathons',
    subcategory: 'Hardware Exhibition',
    date: new Date('2026-10-24T10:00:00Z'),
    description: 'Live demonstrations of autonomous line-followers, ROS2 wheeled bots, and aerial surveillance drones designed by JSPM mechanical and robotics engineers.',
    tags: ['#Robotics', '#Automobile', '#IoT', '#Coding', '#Hardware'],
    registration_link: 'https://forms.gle/ras-jspm-expo-2026',
    venue: 'Mechanical Workshop Bay & Open Lawns',
    isVirtual: false,
    contact_email: 'robotics@jspm.edu.in',
    status: 'active',
    createdAt: new Date(),
  },
  {
    _id: '654321000000000000000104',
    title: 'Tarang 2026: Intra-University Dance & Music Showcase',
    organizing_department_or_club: 'Tarang Cultural Society',
    category: 'Cultural & Fine Arts',
    subcategory: 'Annual Cultural Showcase',
    date: new Date('2026-11-02T16:00:00Z'),
    description: 'Celebrate collegiate talent at JSPM Pune! Solo & group dance face-offs, unplugged acoustic bands, street theatre (Nukkad Natak), and beatboxing battles.',
    tags: ['#Cultural', '#Dance', '#Music', '#PublicSpeaking', '#Dramatics'],
    registration_link: 'https://forms.gle/tarang-jspm-register',
    venue: 'JSPM Open Air Amphitheatre',
    isVirtual: false,
    contact_email: 'cultural@jspm.edu.in',
    status: 'active',
    createdAt: new Date(),
  },
  {
    _id: '654321000000000000000105',
    title: 'Inter-Department Cricket & Football Trophy 2026',
    organizing_department_or_club: 'Yoddha Sports Club',
    category: 'Sports & E-Sports',
    subcategory: 'Inter-Dept Championship',
    date: new Date('2026-10-28T07:30:00Z'),
    description: 'Annual inter-department sports trophy. Knockout cricket matches (T10 format) and 7-a-side football league for boys and girls teams.',
    tags: ['#Sports', '#Cricket', '#Football', '#Fitness'],
    registration_link: 'https://forms.gle/yoddha-jspm-sports',
    venue: 'JSPM University Main Sports Grounds',
    isVirtual: false,
    contact_email: 'sports@jspm.edu.in',
    status: 'active',
    createdAt: new Date(),
  },
  {
    _id: '654321000000000000000106',
    title: 'JSPM Clean Campus & Blood Donation Mega Camp',
    organizing_department_or_club: 'NSS JSPM Chapter',
    category: 'Social Outreach & NSS',
    subcategory: 'Social Service Drive',
    date: new Date('2026-11-08T09:00:00Z'),
    description: 'In collaboration with Ruby Hall Clinic Blood Bank: voluntary blood donation, free health screening, and green tree plantation drive across Tathawade campus.',
    tags: ['#Volunteering', '#SocialWork', '#Health', '#NSS'],
    registration_link: 'https://forms.gle/jspm-nss-blood-drive',
    venue: 'Student Activity Center (SAC) & Health Center',
    isVirtual: false,
    contact_email: 'nss@jspm.edu.in',
    status: 'active',
    createdAt: new Date(),
  },
];

const memoryStore = {
  students: [...initialSeedStudents],
  events: [...initialSeedEvents],
};

// ============================================================================
// 2. THE TAG-INTERSECTION MATCHING ALGORITHM
// ============================================================================

/**
 * Normalizes a tag string by stripping leading '#', trimming, and converting to lowercase.
 * Example: "#WebDev" -> "webdev", "  AI  " -> "ai"
 * 
 * @param {string} tag
 * @returns {string}
 */
export function normalizeTag(tag) {
  return String(tag || '')
    .trim()
    .replace(/^#+/, '')
    .toLowerCase();
}

/**
 * Core Tag-Intersection Matching Algorithm
 * 
 * 1. Takes a specific student's 'interest_tags'.
 * 2. Compares against each event's 'tags'.
 * 3. Calculates the mathematical intersection (overlap) between the two tag sets.
 * 4. Sorts the array of events dynamically so that events with the highest number
 *    of overlapping tags appear first.
 * 5. Uses upcoming event date as secondary tie-breaker (closest events first).
 * 
 * @param {Array<string>} studentTags - Array of student interest tags
 * @param {Array<Object>} events - Candidate active campus events
 * @returns {Array<Object>} - Sorted array of events with matching scores attached
 */
export function calculateTagIntersectionFeed(studentTags = [], events = []) {
  // Build a normalized hash Set of the student's tags for O(1) lookups
  const studentTagSet = new Set(
    (studentTags || [])
      .map(normalizeTag)
      .filter(Boolean)
  );

  // Map each event with its intersection metrics
  const scoredEvents = events.map((event) => {
    // Convert Mongoose document to plain JavaScript object if applicable
    const eventObj = typeof event.toObject === 'function' ? event.toObject() : { ...event };
    const rawTags = Array.isArray(eventObj.tags) ? eventObj.tags : [];

    // Find overlapping tags between student and event
    const overlappingTags = rawTags.filter((tag) => studentTagSet.has(normalizeTag(tag)));
    const overlapCount = overlappingTags.length;

    // Calculate match percentage relative to total event tags
    const matchPercentage =
      rawTags.length > 0 ? Math.round((overlapCount / rawTags.length) * 100) : 0;

    return {
      ...eventObj,
      overlapping_tags: overlappingTags,
      overlap_count: overlapCount,
      matchCount: overlapCount,
      matchPercentage: matchPercentage,
      is_personalized_match: overlapCount > 0,
      isDirectMatch: overlapCount > 0,
    };
  });

  // Dynamically sort events:
  // Primary Criterion: Highest number of overlapping tags first (b.overlap_count - a.overlap_count)
  // Secondary Criterion: Chronological upcoming date (earliest event first)
  scoredEvents.sort((a, b) => {
    if (b.overlap_count !== a.overlap_count) {
      return b.overlap_count - a.overlap_count;
    }
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeA - timeB;
  });

  return scoredEvents;
}

// ============================================================================
// 3. CORE API ENDPOINTS
// ============================================================================

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT 1: POST /api/register-student
 * ----------------------------------------------------------------------------
 * Receives the student dashboard details, validates input, and saves/updates
 * it in MongoDB (or in-memory fallback).
 */
app.post('/api/register-student', async (req, res) => {
  try {
    const {
      name,
      email,
      jspm_prn,
      department,
      interest_tags,
      profile_image,
      year_of_study,
      graduation_year,
    } = req.body;

    // Validation of core student properties
    if (!name || !email || !jspm_prn) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation Failed: Full Name, Email ID, and JSPM PRN are strictly required.',
      });
    }

    const emailFormatted = email.trim().toLowerCase();
    const prnFormatted = jspm_prn.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanDept = (department || 'B.Tech Computer Science & Engineering (CSE)').trim();
    const cleanYear = (year_of_study || '2nd Year').trim();

    // Map year of study to graduation class year if not specified
    const gradMap = {
      '1st Year': 'Class of 2029',
      '2nd Year': 'Class of 2028',
      '3rd Year': 'Class of 2027',
      '4th Year': 'Class of 2026',
    };
    const computedGradYear = graduation_year ? graduation_year.trim() : (gradMap[cleanYear] || 'Class of 2028');

    // Format & normalize tags with uniform '#' prefix only if provided
    let processedTags = undefined;
    if (interest_tags !== undefined && interest_tags !== null) {
      const rawTags = Array.isArray(interest_tags)
        ? interest_tags
        : String(interest_tags).split(',').map((t) => t.trim());

      processedTags = rawTags
        .map((t) => {
          const cleaned = String(t || '').trim();
          if (!cleaned) return null;
          return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
        })
        .filter(Boolean);
    }

    if (isMongoConnected) {
      // Find existing student first to preserve existing tags if none passed
      let existing = await Student.findOne({
        $or: [{ jspm_prn: prnFormatted }, { email: emailFormatted }],
      });

      const tagsToSet = processedTags !== undefined ? processedTags : (existing ? existing.interest_tags : ['#Coding', '#WebDev', '#AI']);

      // Find and update existing student, or insert new one (upsert)
      const student = await Student.findOneAndUpdate(
        {
          $or: [{ jspm_prn: prnFormatted }, { email: emailFormatted }],
        },
        {
          $set: {
            name: cleanName,
            email: emailFormatted,
            jspm_prn: prnFormatted,
            department: cleanDept,
            interest_tags: tagsToSet,
            year_of_study: cleanYear,
            graduation_year: computedGradYear,
            ...(profile_image !== undefined && { profile_image }),
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.status(200).json({
        status: 'success',
        message: 'Student profile registered/updated successfully in MongoDB.',
        data: student,
      });
    } else {
      // In-Memory Fallback
      let existingIndex = memoryStore.students.findIndex(
        (s) =>
          s.jspm_prn.toUpperCase() === prnFormatted ||
          s.email.toLowerCase() === emailFormatted
      );

      let savedStudent;
      if (existingIndex >= 0) {
        const currentStudent = memoryStore.students[existingIndex];
        const tagsToSet = processedTags !== undefined ? processedTags : currentStudent.interest_tags;

        memoryStore.students[existingIndex] = {
          ...currentStudent,
          name: cleanName,
          email: emailFormatted,
          jspm_prn: prnFormatted,
          department: cleanDept,
          year_of_study: cleanYear,
          graduation_year: computedGradYear,
          interest_tags: tagsToSet,
          ...(profile_image !== undefined && { profile_image }),
          updatedAt: new Date(),
        };
        savedStudent = memoryStore.students[existingIndex];
      } else {
        savedStudent = {
          _id: `jspm_stud_${Date.now()}`,
          name: cleanName,
          email: emailFormatted,
          jspm_prn: prnFormatted,
          department: cleanDept,
          year_of_study: cleanYear,
          graduation_year: computedGradYear,
          interest_tags: processedTags !== undefined ? processedTags : ['#Coding', '#WebDev', '#AI'],
          profile_image: profile_image || '',
          registered_events: [],
          completed_events: [],
          createdAt: new Date(),
        };
        memoryStore.students.push(savedStudent);
      }

      return res.status(200).json({
        status: 'success',
        message: 'Student profile registered/updated successfully (in-memory mode).',
        data: savedStudent,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error while registering student.',
    });
  }
});

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT 2: POST /api/post-event
 * ----------------------------------------------------------------------------
 * Receives data from the 1-Minute Quick Post form and writes a new event document
 * into the database.
 */
app.post('/api/post-event', async (req, res) => {
  try {
    const {
      title,
      organizing_department_or_club,
      category,
      date,
      description,
      tags,
      registration_link,
      subcategory,
      venue,
      isVirtual,
      contact_email,
    } = req.body;

    // Strict validation of mandatory fields specified in EventSchema
    if (
      !title ||
      !organizing_department_or_club ||
      !category ||
      !date ||
      !description ||
      !registration_link
    ) {
      return res.status(400).json({
        status: 'error',
        message:
          'Validation Failed: title, organizing_department_or_club, category, date, description, and registration_link are required.',
      });
    }

    // Process and sanitize tags array
    const rawTags = Array.isArray(tags)
      ? tags
      : (tags || '').split(',').map((t) => t.trim());

    const processedTags = rawTags
      .map((t) => {
        const cleaned = String(t || '').trim();
        if (!cleaned) return null;
        return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
      })
      .filter(Boolean);

    const eventPayload = {
      title: title.trim(),
      organizing_department_or_club: organizing_department_or_club.trim(),
      category: category.trim(),
      date: new Date(date),
      description: description.trim(),
      tags: processedTags,
      registration_link: registration_link.trim(),
      subcategory: subcategory?.trim() || 'Campus Event',
      venue: venue?.trim() || (isVirtual ? 'Online (Zoom / GMeet)' : 'JSPM Central Auditorium'),
      isVirtual: Boolean(isVirtual),
      contact_email: contact_email?.trim() || 'events@jspm.edu.in',
      status: 'active',
      createdAt: new Date(),
    };

    if (isMongoConnected) {
      const newEvent = await Event.create(eventPayload);
      return res.status(201).json({
        status: 'success',
        message: 'Event published into MongoDB in under 1 minute!',
        data: newEvent,
      });
    } else {
      const newEvent = {
        _id: `jspm_evt_${Date.now()}`,
        ...eventPayload,
      };
      memoryStore.events.unshift(newEvent);
      return res.status(201).json({
        status: 'success',
        message: 'Event published into database (in-memory mode) in under 1 minute!',
        data: newEvent,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error while posting event.',
    });
  }
});

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT 3: GET /api/jspm-feed/:studentId
 * ----------------------------------------------------------------------------
 * Takes a student's database ID, retrieves their profile interest tags,
 * runs the matching algorithm, and returns the sorted personalized feed as JSON.
 */
app.get('/api/jspm-feed/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { category, search } = req.query;

    let student = null;

    // 1. Retrieve Student profile to extract their 'interest_tags'
    if (isMongoConnected) {
      // Support MongoDB _id, or PRN/Email identifier fallback
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        student = await Student.findById(studentId);
      }
      if (!student) {
        student = await Student.findOne({
          $or: [
            { jspm_prn: studentId.toUpperCase() },
            { email: studentId.toLowerCase() },
          ],
        });
      }
    } else {
      student = memoryStore.students.find(
        (s) =>
          s._id === studentId ||
          s.jspm_prn.toUpperCase() === studentId.toUpperCase() ||
          s.email.toLowerCase() === studentId.toLowerCase()
      );
    }

    // Fallback profile if student not found
    if (!student) {
      student = (memoryStore.students && memoryStore.students[0]) || {
        name: 'JSPM Student',
        email: 'student@jspm.edu.in',
        jspm_prn: 'JSPM2023CS0142',
        department: 'B.Tech Computer Science & Engineering (CSE)',
        interest_tags: ['#Coding', '#WebDev', '#AI'],
      };
    }

    const studentInterestTags = student.interest_tags || [];

    // 2. Fetch all active upcoming campus events from the database
    let candidateEvents = [];
    if (isMongoConnected) {
      const query = { status: { $ne: 'cancelled' } };
      if (category && category !== 'All') {
        query.category = category;
      }
      candidateEvents = await Event.find(query).lean();
    } else {
      candidateEvents = memoryStore.events.filter((e) => {
        const matchesCategory = !category || category === 'All' || e.category === category;
        const isActive = e.status !== 'cancelled';
        return matchesCategory && isActive;
      });
    }

    // Optional real-time search query filtering
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      candidateEvents = candidateEvents.filter((e) => {
        return (
          e.title.toLowerCase().includes(term) ||
          e.description.toLowerCase().includes(term) ||
          e.organizing_department_or_club.toLowerCase().includes(term) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(term))
        );
      });
    }

    // 3. Run the Tag-Intersection Matching Algorithm
    const sortedFeed = calculateTagIntersectionFeed(studentInterestTags, candidateEvents);

    // 4. Return the sorted personalized feed as JSON
    return res.json({
      status: 'success',
      institution: 'JSPM University, Pune',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        jspm_prn: student.jspm_prn,
        prn: student.jspm_prn,
        department: student.department,
        year_of_study: student.year_of_study || '2nd Year',
        degree_year: student.year_of_study || '2nd Year',
        graduation_year: student.graduation_year || 'Class of 2028',
        profile_image: student.profile_image || '',
        registered_count: (student.registered_events || []).length,
        completed_count: (student.completed_events || []).length,
        registered_events: student.registered_events || [],
        completed_events: student.completed_events || [],
        interest_tags: studentInterestTags,
      },
      matched_count: sortedFeed.filter((e) => e.overlap_count > 0).length,
      total_events: sortedFeed.length,
      events: sortedFeed,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error while generating feed.',
    });
  }
});

// ============================================================================
// AUXILIARY CONVENIENCE ENDPOINTS
// ============================================================================

// GET /api/events - List all active events
app.get('/api/events', async (req, res) => {
  try {
    if (isMongoConnected) {
      const events = await Event.find().sort({ date: 1 });
      return res.json({ status: 'success', count: events.length, data: events });
    }
    return res.json({ status: 'success', count: memoryStore.events.length, data: memoryStore.events });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/students - List registered students
app.get('/api/students', async (req, res) => {
  try {
    if (isMongoConnected) {
      const students = await Student.find().sort({ createdAt: -1 });
      return res.json({ status: 'success', count: students.length, data: students });
    }
    return res.json({ status: 'success', count: memoryStore.students.length, data: memoryStore.students });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/student/login - Student email single sign-on / fast login
app.post('/api/student/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ status: 'error', message: 'Valid Email ID is required.' });
    }

    const emailFormatted = email.trim().toLowerCase();

    if (isMongoConnected) {
      let student = await Student.findOne({ email: emailFormatted });
      if (!student) {
        const namePart = emailFormatted.split('@')[0];
        const generatedName =
          namePart
            .split(/[\.\_\-]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') || 'JSPM Student';
        const randomPrn = `JSPM2024CS${Math.floor(1000 + Math.random() * 9000)}`;

        student = await Student.create({
          name: generatedName,
          email: emailFormatted,
          jspm_prn: randomPrn,
          department: 'B.Tech Computer Science & Engineering (CSE)',
          year_of_study: '2nd Year',
          graduation_year: 'Class of 2028',
          interest_tags: ['#Coding', '#WebDev', '#AI'],
          profile_image: '',
          registered_events: [],
          completed_events: [],
        });
      }

      return res.json({
        status: 'success',
        message: 'Signed in successfully.',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          jspm_prn: student.jspm_prn,
          prn: student.jspm_prn,
          department: student.department,
          year_of_study: student.year_of_study || '2nd Year',
          degree_year: student.year_of_study || '2nd Year',
          graduation_year: student.graduation_year || 'Class of 2028',
          profile_image: student.profile_image || '',
          registered_events: student.registered_events || [],
          completed_events: student.completed_events || [],
          interest_tags: student.interest_tags || [],
          registered_count: (student.registered_events || []).length,
          completed_count: (student.completed_events || []).length,
        },
      });
    } else {
      let student = memoryStore.students.find((s) => s.email.toLowerCase() === emailFormatted);
      if (!student) {
        const namePart = emailFormatted.split('@')[0];
        const generatedName =
          namePart
            .split(/[\.\_\-]/)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') || 'JSPM Student';
        const randomPrn = `JSPM2024CS${Math.floor(1000 + Math.random() * 9000)}`;

        student = {
          _id: `jspm_stud_${Date.now()}`,
          name: generatedName,
          email: emailFormatted,
          jspm_prn: randomPrn,
          department: 'B.Tech Computer Science & Engineering (CSE)',
          year_of_study: '2nd Year',
          graduation_year: 'Class of 2028',
          interest_tags: ['#Coding', '#WebDev', '#AI'],
          profile_image: '',
          registered_events: [],
          completed_events: [],
          createdAt: new Date(),
        };
        memoryStore.students.push(student);
      }

      return res.json({
        status: 'success',
        message: 'Signed in successfully.',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          jspm_prn: student.jspm_prn,
          prn: student.jspm_prn,
          department: student.department,
          year_of_study: student.year_of_study || '2nd Year',
          degree_year: student.year_of_study || '2nd Year',
          graduation_year: student.graduation_year || 'Class of 2028',
          profile_image: student.profile_image || '',
          registered_events: student.registered_events || [],
          completed_events: student.completed_events || [],
          interest_tags: student.interest_tags || [],
          registered_count: (student.registered_events || []).length,
          completed_count: (student.completed_events || []).length,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/student/update-profile - Instant Editable Profile Update
app.post('/api/student/update-profile', async (req, res) => {
  try {
    const { studentId, name, email, jspm_prn, year_of_study, department } = req.body;

    if (!name || !email || !jspm_prn) {
      return res.status(400).json({
        status: 'error',
        message: 'Full Name, Email ID, and JSPM PRN are required.',
      });
    }

    const emailFormatted = email.trim().toLowerCase();
    const prnFormatted = jspm_prn.trim().toUpperCase();
    const cleanName = name.trim();
    const yearStudy = (year_of_study || '2nd Year').trim();

    if (isMongoConnected) {
      let student = null;
      if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
        student = await Student.findById(studentId);
      }
      if (!student) {
        student = await Student.findOne({
          $or: [{ jspm_prn: prnFormatted }, { email: emailFormatted }],
        });
      }

      if (!student) {
        student = await Student.create({
          name: cleanName,
          email: emailFormatted,
          jspm_prn: prnFormatted,
          department: department ? department.trim() : 'B.Tech Computer Science & Engineering (CSE)',
          year_of_study: yearStudy,
          graduation_year: 'Class of 2028',
          interest_tags: ['#Coding', '#WebDev', '#AI'],
          profile_image: '',
          registered_events: [],
          completed_events: [],
        });
      } else {
        student.name = cleanName;
        student.email = emailFormatted;
        student.jspm_prn = prnFormatted;
        student.year_of_study = yearStudy;
        if (department) student.department = department.trim();
        await student.save();
      }

      return res.json({
        status: 'success',
        message: 'Profile updated instantly.',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          jspm_prn: student.jspm_prn,
          prn: student.jspm_prn,
          department: student.department,
          year_of_study: student.year_of_study,
          profile_image: student.profile_image || '',
          registered_events: student.registered_events || [],
          completed_events: student.completed_events || [],
          interest_tags: student.interest_tags || [],
          registered_count: (student.registered_events || []).length,
          completed_count: (student.completed_events || []).length,
        },
      });
    } else {
      let student = memoryStore.students.find(
        (s) =>
          (studentId && s._id === studentId) ||
          s.jspm_prn.toUpperCase() === prnFormatted ||
          s.email.toLowerCase() === emailFormatted
      );

      if (!student) {
        student = {
          _id: `jspm_stud_${Date.now()}`,
          name: cleanName,
          email: emailFormatted,
          jspm_prn: prnFormatted,
          department: department ? department.trim() : 'B.Tech Computer Science & Engineering (CSE)',
          year_of_study: yearStudy,
          graduation_year: 'Class of 2028',
          interest_tags: ['#Coding', '#WebDev', '#AI'],
          profile_image: '',
          registered_events: [],
          completed_events: [],
          createdAt: new Date(),
        };
        memoryStore.students.push(student);
      } else {
        student.name = cleanName;
        student.email = emailFormatted;
        student.jspm_prn = prnFormatted;
        student.year_of_study = yearStudy;
        if (department) student.department = department.trim();
      }

      return res.json({
        status: 'success',
        message: 'Profile updated instantly.',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          jspm_prn: student.jspm_prn,
          prn: student.jspm_prn,
          department: student.department,
          year_of_study: student.year_of_study,
          profile_image: student.profile_image || '',
          registered_events: student.registered_events || [],
          completed_events: student.completed_events || [],
          interest_tags: student.interest_tags || [],
          registered_count: (student.registered_events || []).length,
          completed_count: (student.completed_events || []).length,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/student/upload-avatar - Save profile photo
app.post('/api/student/upload-avatar', async (req, res) => {
  try {
    const { studentId, image } = req.body;
    if (!studentId || !image) {
      return res.status(400).json({
        status: 'error',
        message: 'studentId and image string are required.',
      });
    }

    const prnFormatted = String(studentId).trim().toUpperCase();

    if (isMongoConnected) {
      let student = null;
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        student = await Student.findById(studentId);
      }
      if (!student) {
        student = await Student.findOne({ jspm_prn: prnFormatted });
      }

      if (!student) {
        return res.status(404).json({ status: 'error', message: 'Student not found.' });
      }

      student.profile_image = image;
      await student.save();

      return res.json({
        status: 'success',
        message: 'Avatar uploaded and saved successfully.',
        profile_image: student.profile_image,
      });
    } else {
      let student = memoryStore.students.find(
        (s) => s._id === studentId || s.jspm_prn.toUpperCase() === prnFormatted
      );

      if (!student) {
        student = memoryStore.students[0];
      }

      student.profile_image = image;
      return res.json({
        status: 'success',
        message: 'Avatar uploaded and saved successfully.',
        profile_image: student.profile_image,
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /api/student/register-event/:eventId - Register for an event
app.post('/api/student/register-event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { studentId } = req.body;

    const prnOrId = String(studentId || 'JSPM2023CS0142').trim().toUpperCase();

    if (isMongoConnected) {
      let student = null;
      if (mongoose.Types.ObjectId.isValid(prnOrId)) {
        student = await Student.findById(prnOrId);
      }
      if (!student) {
        student = await Student.findOne({ jspm_prn: prnOrId });
      }
      if (!student) {
        return res.status(404).json({ status: 'error', message: 'Student not found' });
      }

      student.registered_events = student.registered_events || [];
      const alreadyRegistered = student.registered_events.some(
        (id) => String(id) === String(eventId)
      );

      if (!alreadyRegistered) {
        if (mongoose.Types.ObjectId.isValid(eventId)) {
          student.registered_events.push(eventId);
        } else {
          student.registered_events.push(new mongoose.Types.ObjectId());
        }
        await student.save();
      }

      return res.json({
        status: 'success',
        message: 'Event registered successfully.',
        registered_count: student.registered_events.length,
        completed_count: (student.completed_events || []).length,
        registered_events: student.registered_events,
      });
    } else {
      let student = memoryStore.students.find(
        (s) => s._id === studentId || s.jspm_prn.toUpperCase() === prnOrId
      );

      if (!student) {
        student = memoryStore.students[0];
      }

      student.registered_events = student.registered_events || [];
      if (!student.registered_events.includes(eventId)) {
        student.registered_events.push(eventId);
      }

      return res.json({
        status: 'success',
        message: 'Event registered successfully.',
        registered_count: student.registered_events.length,
        completed_count: (student.completed_events || []).length,
        registered_events: student.registered_events,
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'FestFlow Event Matching Engine',
    database: isMongoConnected ? 'connected (MongoDB)' : 'in-memory fallback (active)',
    mongodb_uri: MONGODB_URI.replace(/\/\/.*@/, '//***@'),
    timestamp: new Date().toISOString(),
  });
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// 4. SERVER BOOTSTRAP & MONGODB CONNECTION
// ============================================================================

/**
 * Connect to MongoDB with automatic retry and graceful fallback
 */
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
  })
  .then(async () => {
    isMongoConnected = true;
    console.log(`[FestFlow MongoDB] Successfully connected to: ${MONGODB_URI}`);

    // Seed database if empty
    try {
      const studentCount = await Student.countDocuments();
      if (studentCount === 0) {
        await Student.insertMany(initialSeedStudents);
        console.log('[FestFlow MongoDB] Seeded initial student profiles.');
      }

      const eventCount = await Event.countDocuments();
      if (eventCount === 0) {
        await Event.insertMany(initialSeedEvents);
        console.log('[FestFlow MongoDB] Seeded initial campus events.');
      }
    } catch (seedErr) {
      console.warn('[FestFlow MongoDB] Seeding note:', seedErr.message);
    }
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn(`[FestFlow MongoDB Notice] MongoDB connection attempt failed: ${err.message}`);
    console.warn(`[FestFlow Fallback] Running with in-memory store. Start MongoDB with 'mongod' or set MONGODB_URI in .env to connect to a live instance.`);
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('[FestFlow Mongoose] Connection established.');
});

mongoose.connection.on('error', (err) => {
  console.warn('[FestFlow Mongoose] Runtime error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('[FestFlow Mongoose] Connection disconnected.');
});

// Start Express HTTP Server
const server = app.listen(PORT, '0.0.0.0', () => {
  const actualPort = server.address()?.port || PORT;
  console.log(`================================================================`);
  console.log(` FESTFLOW ENGINE — JSPM Campus Event Discovery Platform         `);
  console.log(` Server listening on port ${actualPort}: http://localhost:${actualPort} `);
  console.log(`----------------------------------------------------------------`);
  console.log(` Core Endpoints:                                                `);
  console.log(` 1. POST http://localhost:${actualPort}/api/register-student    `);
  console.log(` 2. POST http://localhost:${actualPort}/api/post-event          `);
  console.log(` 3. GET  http://localhost:${actualPort}/api/jspm-feed/:studentId`);
  console.log(` 4. GET  http://localhost:${actualPort}/api/health              `);
  console.log(`================================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`[FestFlow Notice] Port ${PORT} is in use. Trying fallback port ${nextPort}...`);
    server.listen(nextPort, '0.0.0.0');
  } else {
    console.error('[FestFlow Server Error]:', err.message);
  }
});

export default app;

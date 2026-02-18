export interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  children: (FolderNode | DocumentNode)[];
  path: string[];
}

export interface DocumentNode {
  id: string;
  name: string;
  type: 'file';
  parentId: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  downloads: number;
  tags: string[];
  subject?: string;
  classLevel?: string;
  year?: string;
  status: 'approved' | 'pending' | 'rejected';
  description?: string;
}

export type TreeNode = FolderNode | DocumentNode;

export const tags = [
  'Mock', 'National Exam', 'Revision', 'Answers', 'Important',
  'Updated', 'Teacher Copy', 'Student Copy', 'Term 1', 'Term 2', 'Term 3',
];

export const subjects = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'History', 'Geography', 'Computer Science', 'Economics', 'French',
];

export const classLevels = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export const years = ['2024', '2023', '2022', '2021', '2020', '2019'];

// Flat documents list for search/featured
export const allDocuments: DocumentNode[] = [
  {
    id: 'doc-1', name: 'Mathematics Final Exam 2024.pdf', type: 'file',
    parentId: 'folder-s6-math-2024', fileType: 'PDF', fileSize: '2.4 MB',
    uploadDate: '2024-12-15', uploadedBy: 'Mr. Kamanzi', downloads: 342,
    tags: ['National Exam', 'Important'], subject: 'Mathematics', classLevel: 'S6', year: '2024',
    status: 'approved', description: 'National examination paper for S6 Mathematics 2024.',
  },
  {
    id: 'doc-2', name: 'Physics Paper 1 - Mechanics.pdf', type: 'file',
    parentId: 'folder-s6-physics-2024', fileType: 'PDF', fileSize: '1.8 MB',
    uploadDate: '2024-11-20', uploadedBy: 'Mrs. Uwimana', downloads: 289,
    tags: ['National Exam', 'Answers'], subject: 'Physics', classLevel: 'S6', year: '2024',
    status: 'approved', description: 'S6 Physics Paper 1 focusing on Mechanics with marking scheme.',
  },
  {
    id: 'doc-3', name: 'Chemistry Notes - Organic Chemistry.pdf', type: 'file',
    parentId: 'folder-s5-chem', fileType: 'PDF', fileSize: '5.1 MB',
    uploadDate: '2024-10-05', uploadedBy: 'Mr. Habimana', downloads: 198,
    tags: ['Revision', 'Student Copy', 'Important'], subject: 'Chemistry', classLevel: 'S5', year: '2024',
    status: 'approved', description: 'Comprehensive organic chemistry revision notes for S5.',
  },
  {
    id: 'doc-4', name: 'English Language Mock Exam.pdf', type: 'file',
    parentId: 'folder-s4-eng', fileType: 'PDF', fileSize: '1.2 MB',
    uploadDate: '2024-09-18', uploadedBy: 'Ms. Mutesi', downloads: 156,
    tags: ['Mock', 'Student Copy'], subject: 'English', classLevel: 'S4', year: '2024',
    status: 'approved', description: 'Mock examination for S4 English Language.',
  },
  {
    id: 'doc-5', name: 'Biology - Cell Division Slides.pptx', type: 'file',
    parentId: 'folder-s3-bio', fileType: 'PPTX', fileSize: '8.3 MB',
    uploadDate: '2024-08-22', uploadedBy: 'Dr. Niyonzima', downloads: 421,
    tags: ['Revision', 'Updated', 'Important'], subject: 'Biology', classLevel: 'S3', year: '2024',
    status: 'approved', description: 'Updated presentation slides on cell division for S3 Biology.',
  },
  {
    id: 'doc-6', name: 'History of East Africa - Term 2 Notes.pdf', type: 'file',
    parentId: 'folder-s2-hist', fileType: 'PDF', fileSize: '3.7 MB',
    uploadDate: '2024-07-10', uploadedBy: 'Mr. Mugisha', downloads: 87,
    tags: ['Term 2', 'Student Copy'], subject: 'History', classLevel: 'S2', year: '2024',
    status: 'approved', description: 'Complete Term 2 notes on History of East Africa.',
  },
  {
    id: 'doc-7', name: 'Geography Map Reading Guide.pdf', type: 'file',
    parentId: 'folder-s1-geo', fileType: 'PDF', fileSize: '4.5 MB',
    uploadDate: '2024-06-05', uploadedBy: 'Mrs. Ingabire', downloads: 134,
    tags: ['Revision', 'Student Copy'], subject: 'Geography', classLevel: 'S1', year: '2024',
    status: 'approved', description: 'Comprehensive guide on map reading skills for S1.',
  },
  {
    id: 'doc-8', name: 'Computer Science - Python Basics.pdf', type: 'file',
    parentId: 'folder-s4-cs', fileType: 'PDF', fileSize: '2.1 MB',
    uploadDate: '2024-11-01', uploadedBy: 'Mr. Ndayisaba', downloads: 267,
    tags: ['Revision', 'Updated'], subject: 'Computer Science', classLevel: 'S4', year: '2024',
    status: 'approved', description: 'Introduction to Python programming for S4 students.',
  },
  {
    id: 'doc-9', name: 'Economics - Supply and Demand.pdf', type: 'file',
    parentId: 'folder-s5-econ', fileType: 'PDF', fileSize: '1.6 MB',
    uploadDate: '2024-10-20', uploadedBy: 'Ms. Kayitesi', downloads: 145,
    tags: ['Term 1', 'Student Copy'], subject: 'Economics', classLevel: 'S5', year: '2024',
    status: 'approved', description: 'Supply and Demand analysis notes for S5 Economics.',
  },
  {
    id: 'doc-10', name: 'French Grammar Exercises.pdf', type: 'file',
    parentId: 'folder-s2-french', fileType: 'PDF', fileSize: '0.9 MB',
    uploadDate: '2024-05-14', uploadedBy: 'Mme. Dushime', downloads: 93,
    tags: ['Revision', 'Student Copy'], subject: 'French', classLevel: 'S2', year: '2024',
    status: 'approved', description: 'Grammar exercises for S2 French language learners.',
  },
  {
    id: 'doc-11', name: 'Mathematics Mock 2023.pdf', type: 'file',
    parentId: 'folder-s6-math-2023', fileType: 'PDF', fileSize: '2.0 MB',
    uploadDate: '2023-11-10', uploadedBy: 'Mr. Kamanzi', downloads: 512,
    tags: ['Mock', 'Answers', 'Important'], subject: 'Mathematics', classLevel: 'S6', year: '2023',
    status: 'approved', description: 'S6 Mathematics Mock Exam 2023 with solutions.',
  },
  {
    id: 'doc-12', name: 'Physics Practical Guide.pdf', type: 'file',
    parentId: 'folder-s6-physics-2023', fileType: 'PDF', fileSize: '3.2 MB',
    uploadDate: '2023-09-25', uploadedBy: 'Mrs. Uwimana', downloads: 378,
    tags: ['Revision', 'Teacher Copy'], subject: 'Physics', classLevel: 'S6', year: '2023',
    status: 'approved', description: 'Practical laboratory guide for S6 Physics experiments.',
  },
];

// Folder tree structure
export const folderTree: FolderNode = {
  id: 'root',
  name: 'Documents',
  type: 'folder',
  parentId: null,
  path: [],
  children: [
    {
      id: 'past-papers', name: 'Past Papers', type: 'folder', parentId: 'root',
      path: ['Past Papers'],
      children: [
        {
          id: 'pp-2024', name: '2024', type: 'folder', parentId: 'past-papers',
          path: ['Past Papers', '2024'],
          children: classLevels.map(cl => ({
            id: `pp-2024-${cl.toLowerCase()}`, name: cl, type: 'folder' as const, parentId: 'pp-2024',
            path: ['Past Papers', '2024', cl],
            children: subjects.slice(0, 5).map(sub => ({
              id: `pp-2024-${cl.toLowerCase()}-${sub.toLowerCase()}`, name: sub, type: 'folder' as const,
              parentId: `pp-2024-${cl.toLowerCase()}`,
              path: ['Past Papers', '2024', cl, sub],
              children: [],
            })),
          })),
        },
        {
          id: 'pp-2023', name: '2023', type: 'folder', parentId: 'past-papers',
          path: ['Past Papers', '2023'],
          children: classLevels.slice(3).map(cl => ({
            id: `pp-2023-${cl.toLowerCase()}`, name: cl, type: 'folder' as const, parentId: 'pp-2023',
            path: ['Past Papers', '2023', cl],
            children: subjects.slice(0, 3).map(sub => ({
              id: `pp-2023-${cl.toLowerCase()}-${sub.toLowerCase()}`, name: sub, type: 'folder' as const,
              parentId: `pp-2023-${cl.toLowerCase()}`,
              path: ['Past Papers', '2023', cl, sub],
              children: [],
            })),
          })),
        },
      ],
    },
    {
      id: 'notes', name: 'Notes & Study Materials', type: 'folder', parentId: 'root',
      path: ['Notes & Study Materials'],
      children: classLevels.map(cl => ({
        id: `notes-${cl.toLowerCase()}`, name: cl, type: 'folder' as const, parentId: 'notes',
        path: ['Notes & Study Materials', cl],
        children: subjects.map(sub => ({
          id: `notes-${cl.toLowerCase()}-${sub.toLowerCase()}`, name: sub, type: 'folder' as const,
          parentId: `notes-${cl.toLowerCase()}`,
          path: ['Notes & Study Materials', cl, sub],
          children: [],
        })),
      })),
    },
    {
      id: 'national-exams', name: 'National Examinations', type: 'folder', parentId: 'root',
      path: ['National Examinations'],
      children: years.map(yr => ({
        id: `ne-${yr}`, name: yr, type: 'folder' as const, parentId: 'national-exams',
        path: ['National Examinations', yr],
        children: classLevels.slice(3).map(cl => ({
          id: `ne-${yr}-${cl.toLowerCase()}`, name: cl, type: 'folder' as const,
          parentId: `ne-${yr}`,
          path: ['National Examinations', yr, cl],
          children: [],
        })),
      })),
    },
    {
      id: 'mock-exams', name: 'Mock Examinations', type: 'folder', parentId: 'root',
      path: ['Mock Examinations'],
      children: [],
    },
    {
      id: 'revision', name: 'Revision Materials', type: 'folder', parentId: 'root',
      path: ['Revision Materials'],
      children: [],
    },
  ],
};

export const announcements = [
  { id: 1, title: 'S6 National Exam Papers 2024 Now Available', date: '2024-12-15', type: 'new' as const },
  { id: 2, title: 'Term 3 Revision Materials Updated', date: '2024-11-28', type: 'update' as const },
  { id: 3, title: 'Mock Examinations Schedule Released', date: '2024-11-10', type: 'announcement' as const },
];

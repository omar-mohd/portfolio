import certMl from './assets/cert-purdue-ml.webp'
import certManufacturing from './assets/cert-purdue-manufacturing.webp'
import certAiSingapore from './assets/cert-ai-singapore.webp'
import certPython from './assets/cert-topcoders-python.webp'

// Every word on the site lives here. Edit this file to update the portfolio.
// Nothing below is invented: it is taken from the resume. Empty fields are
// simply not rendered, so fill them in when you have them.

export const person = {
  name: ['Omar', 'Mohamed', 'Swaleh'],
  monogram: 'OMS',
  role: 'Software engineering graduate',
  intro:
    'I build full-stack software, and I am working my way towards cloud engineering, artificial intelligence and system architecture.',
  email: '3omar.mohd2000@gmail.com',
  linkedin: 'https://www.linkedin.com/in/omar-mohammed-994026261',
  github: '', // add your GitHub URL here and it appears in Contact
}

export const welcomeWords = [
  { text: 'Welcome', lang: 'en' },
  { text: 'Willkommen', lang: 'de' },
  { text: 'Bienvenue', lang: 'fr' },
  { text: 'Bienvenido', lang: 'es' },
  { text: 'Benvenuto', lang: 'it' },
  { text: 'ようこそ', lang: 'ja' },
  { text: '환영합니다', lang: 'ko' },
  { text: '欢迎', lang: 'zh' },
  { text: 'مرحباً', lang: 'ar', dir: 'rtl' },
  { text: 'Karibu', lang: 'sw' },
  { text: 'Selamat Datang', lang: 'ms' },
]

export const about = {
  heading: 'A software engineer, still under construction.',
  paragraphs: [
    'I studied Software Engineering at Universiti Tunku Abdul Rahman in Malaysia and finished in 2026 with a research project on lane detection for driver-assistance systems.',
    'Before university I spent two years as a data entry clerk at Info Fort, where the whole job was accuracy: record after record, kept consistent. During my degree I joined Kidocode, teaching students Python, web basics and Arduino, and testing the Crawl4AI web crawler with the QA team.',
    'Along the way I built things end to end: an inventory and sales terminal in Flutter and FastAPI, a Laravel site with its assets on AWS S3, a containerised team project with CI/CD.',
    'Where I want to go is cloud engineering, data science and AI, and eventually system architecture. I am not there yet. The foundation is software engineering, and I am building on it.',
  ],
  facts: [
    { label: 'Degree', value: 'B.Sc. (Hons) Software Engineering' },
    { label: 'University', value: 'UTAR, Malaysia' },
    { label: 'Graduated', value: '2026' },
    { label: 'Looking for', value: 'Cloud, AI and software engineering roles' },
  ],
}

export const skills = [
  { group: 'Languages', items: ['Python', 'JavaScript', 'Dart', 'PHP', 'HTML', 'CSS'] },
  { group: 'Frameworks', items: ['FastAPI', 'Flutter', 'Laravel'] },
  { group: 'Cloud and infrastructure', items: ['AWS S3', 'Docker'] },
  { group: 'Data science and AI', items: ['U-Net', 'Image segmentation', 'CLAHE preprocessing', 'Model evaluation (IoU, Dice)', 'Google Colab'] },
  { group: 'Data and authentication', items: ['SQLite', 'Firebase Authentication'] },
  { group: 'Tools and testing', items: ['Git', 'GitHub', 'CI/CD', 'Software QA and testing'] },
  { group: 'Hardware', items: ['Arduino'] },
]

export const featured = {
  kind: 'Final year project, 2026',
  title: 'Teaching a small network to see lane lines',
  formalTitle: 'Lightweight U-Net with CLAHE Preprocessing for Lane Detection in ADAS',
  problem:
    'Driver-assistance systems need lane segmentation that fits on modest hardware. The research target was a model under 2 million parameters that still holds up in shadows, glare and low light.',
  contribution:
    'I developed the model, built the preprocessing and post-processing pipeline, and ran the evaluation and ablation experiments. Training used 6,000+ TuSimple highway images at 256 × 256 on Google Colab with an NVIDIA Tesla T4.',
  pipeline: [
    'CLAHE contrast enhancement',
    'Lightweight U-Net segmentation',
    'Static trapezoidal ROI mask',
    'Morphological closing',
    'Connected components analysis',
    'Lane line fitting',
  ],
  metrics: [
    { value: '1.95M', label: 'parameters, under the 2M target' },
    { value: '0.5349', label: 'mean IoU on TuSimple' },
    { value: '0.6906', label: 'mean Dice' },
    { value: '92.25%', label: 'accuracy' },
    { value: '13.70', label: 'frames per second' },
  ],
  decisions: [
    {
      title: 'Standard convolutions beat depthwise-separable ones',
      body: 'The depthwise-separable U-Net looked lighter on paper, but the standard-convolution version was both faster and more accurate. The bottleneck was memory bandwidth, not parameter count.',
    },
    {
      title: 'CLAHE earns its place only in bad light',
      body: 'Ablations showed a negligible effect on well-lit data and consistent gains under shadows, glare and low light. Its value is in difficult lighting, not in the average frame.',
    },
    {
      title: 'Measure more than accuracy',
      body: 'Alongside accuracy, the model was evaluated with IoU, Dice, precision, false positive rate, false negative rate and inference time.',
    },
  ],
  stack: ['Python', 'U-Net', 'CLAHE', 'Google Colab', 'Tesla T4', 'TuSimple'],
  github: '',
  demo: '',
}

export const projects = [
  {
    title: 'Inventory and Sales Tracking Terminal',
    summary: 'A full-stack inventory and sales terminal with a custom dark "obsidian" fintech interface.',
    problem: 'Stock and sales figures have to stay correct when several people use the system at once, and every change has to be traceable.',
    contribution: 'Built the whole thing: Flutter Web front end, FastAPI back end, SQLite storage.',
    decisions: [
      'Concurrency control so simultaneous edits cannot corrupt inventory or sales data',
      'Firebase Authentication with role-based access control',
      'Immutable audit logging that records every change',
      'Batch data pipelines',
    ],
    stack: ['Flutter Web', 'FastAPI', 'SQLite', 'Firebase Authentication'],
    github: '',
    demo: '',
  },
  {
    title: 'Cloud-Hosted Laravel Website',
    summary: 'A Laravel website deployed to the cloud as a team project.',
    problem: 'Deploy a PHP application to the cloud, with its assets served from object storage.',
    contribution: 'Developed the site in Laravel and stored its assets in Amazon S3 buckets, working within a team.',
    decisions: ['Assets kept in S3 rather than on the application server'],
    stack: ['Laravel', 'PHP', 'AWS S3'],
    github: '',
    demo: '',
  },
  {
    title: 'CI/CD and Docker Collaboration',
    summary: 'A team extension of an existing open-source GitHub project.',
    problem: 'Show that an application can be built, shipped and run the same way on any machine.',
    contribution: 'Contributed changes through commits and pushes alongside teammates, each working on separate parts.',
    decisions: [
      'Containerised the application with Docker for consistent runs',
      'Applied CI/CD practices for an automated build and deployment workflow',
    ],
    stack: ['Git', 'GitHub', 'Docker', 'CI/CD'],
    github: '',
    demo: '',
  },
]

export const experience = [
  {
    years: '2025–26',
    period: 'Oct 2025 to Jan 2026',
    role: 'Assistant Trainer',
    company: 'Kidocode',
    points: [
      'Taught students programming and electronics fundamentals: Python, HTML, CSS, JavaScript and Arduino.',
      'Guided students through hands-on coding exercises and helped them troubleshoot their own code.',
    ],
  },
  {
    years: '2025–26',
    period: 'Oct 2025 to Jan 2026',
    role: 'Quality Assurance Tester',
    company: 'Kidocode',
    points: [
      'Worked within the QA team testing Crawl4AI, a web crawler, to verify that features behaved as expected.',
      'Executed test cases and reported issues to help keep the product stable.',
    ],
  },
  {
    years: '2021–23',
    period: 'Jul 2021 to Aug 2023',
    role: 'Data Entry Clerk',
    company: 'Info Fort (Information Fortress)',
    points: ['Entered and maintained records accurately, with attention to detail and data consistency.'],
  },
]

export const education = {
  degree: 'B.Sc. (Hons) Software Engineering',
  school: 'Universiti Tunku Abdul Rahman',
  schoolShort: 'UTAR',
  period: 'Oct 2023 to Oct 2026',
  detail: 'CGPA 3.09',
}

// Add certificates here. `image` is optional: import the file from src/assets
// and pass it in. Example:
//   { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: 'Mar 2026', image: awsCert }
export const certificates = [
  {
    name: 'Machine Learning in Action: Tools, Techniques, and Industrial Cases',
    kind: 'Microcredential',
    issuer: 'Purdue University Online',
    date: '25 July 2026',
    image: certMl,
  },
  {
    name: 'Manufacturing Analytics',
    kind: 'Microcredential',
    issuer: 'Purdue University Online',
    date: '18 July 2026',
    image: certManufacturing,
  },
  {
    name: 'AI for Good Workshop',
    kind: 'Certificate of completion',
    issuer: 'AI Singapore',
    date: '22 June 2026',
    image: certAiSingapore,
  },
  {
    name: 'Python Programming Fundamentals',
    kind: 'Pre-competition workshop, Top Coders Malaysia 2025 Coding Challenge',
    issuer: 'Data Science Association',
    date: '2025',
    image: certPython,
  },
]

export const direction = [
  {
    word: 'Cloud',
    soFar: 'A Laravel site with its assets on S3, a containerised app, a CI/CD workflow.',
    next: 'Deeper infrastructure work: deploying, scaling and operating real services.',
  },
  {
    word: 'Intelligence',
    soFar: 'A 1.95M-parameter U-Net that I trained, evaluated and took apart with ablations.',
    next: 'More models, more data, and getting them to run outside a notebook.',
  },
  {
    word: 'Architecture',
    soFar: 'Concurrency control, role-based access and audit logging inside one system.',
    next: 'Learning how many systems fit together, and why they are shaped the way they are.',
  },
]

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'direction', label: 'Direction' },
  { id: 'contact', label: 'Contact' },
]

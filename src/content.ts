// Every piece of text on the site lives here, so edits never touch components.

export const profile = {
  name: 'Yuvraj Singh',
  handle: 'yuvixmahar',
  roles: ['software engineer', 'embedded systems'],
  next: 'ai/ml',
  location: 'Winnipeg, MB',
  status: 'seeking Summer 2027 co-op',
  resume: 'Yuvraj_Singh_Resume.pdf',
  education: {
    degree: 'B.Sc. Computer Engineering (Co-op)',
    school: 'University of Manitoba',
    end: 'expected Apr 2028',
  },
  bio:
    'Computer engineering student at the University of Manitoba, focused on software engineering: ' +
    "backends, APIs, and the tools around them. On the side I enjoy embedded work, like ESP32 firmware for the " +
    'university robotics team and small sensor projects.',
  links: {
    github: 'https://github.com/yuvixmahar',
    linkedin: 'https://www.linkedin.com/in/yuvixmahar',
    email: 'singhy5@myumanitoba.ca',
  },
} as const

export type Experience = {
  role: string
  company: string
  dates: string
  place: string
  bullets: string[]
  tags: string[]
}

export const experience: Experience[] = [
  {
    role: 'Controls Engineer Intern',
    company: 'Winnipeg School Division',
    dates: 'Jun 2026 – Aug 2026',
    place: 'Winnipeg, MB',
    bullets: [
      'Restored full 4-stage cooling on a rooftop unit that was capped at 1–2 stages, by rewriting a faulty GCL+ staging threshold and coordinating contractor commissioning.',
      'Diagnosed control issues across 10 AHUs/RTUs and 4 HRVs/ERVs in 5 school buildings using live BACnet tracking in Delta Controls enteliWEB.',
      'Cataloged 8 sensor and logic defects in a formal issues report, driving code fixes and enteliWEB graphic redesigns.',
    ],
    tags: ['GCL+', 'BACnet', 'Delta Controls enteliWEB', 'HVAC controls'],
  },
  {
    role: 'Software Engineer Intern',
    company: 'Quark Power Inc.',
    dates: 'Sep 2025 – May 2026',
    place: 'Winnipeg, MB',
    bullets: [
      'Shipped a full-stack license management platform as the sole engineer, with 60+ REST endpoints for provisioning, authentication, machine registration, and telemetry.',
      'Modeled 8 relational tables in MySQL with SQLAlchemy, versioning every schema change through Alembic migrations.',
      'Owned the on-premise production deployment on Ubuntu Linux, configuring Nginx and systemd for long-running services.',
      'Built a secure installer download service on Cloudflare R2 using presigned URLs and streaming responses.',
      'Secured the API with JWT authentication and per-user/per-machine Redis rate limiting.',
    ],
    tags: ['React', 'TypeScript', 'FastAPI', 'MySQL', 'Redis', 'Nginx', 'Linux', 'Cloudflare R2'],
  },
]

// A screenshot or clip on a project page. Leave `src` out to show a
// placeholder frame; once the file is in public/projects/<slug>/, set `src`
// to its path relative to public/ (e.g. 'projects/bisonplan/search.png').
// For a video, `start` (seconds) skips an intro such as a sign-in or disclaimer.
export type Media = { kind?: 'image' | 'video'; src?: string; start?: number; alt: string; caption: string }

// One box in a block diagram; `external` draws it dashed (a system I don't own).
export type FlowNode = { title: string; detail: string; external?: boolean }

export type ProjectDetail = {
  problem: string[]
  features: string[]
  // Boxes left to right, with one label per arrow between them.
  flow?: { nodes: FlowNode[]; edges: string[]; footnote?: string }
  media: Media[]
  stack: { name: string; why: string }[]
  role: string
  challenges: { title: string; body: string }[]
  results: string[]
  next?: string[]
}

export type Project = {
  name: string
  // URL piece for the project page: #/projects/<slug>
  slug: string
  tagline: string
  dates: string
  kind: 'embedded' | 'software'
  stats?: string[]
  bullets: string[]
  tags: string[]
  links: { label: string; href: string }[]
  // Present = the card links to a full project page.
  detail?: ProjectDetail
}

export const projects: Project[] = [
  {
    name: 'Wireless Environmental Monitor',
    slug: 'wireless-environmental-monitor',
    tagline: 'A standalone sensor node that serves its own live dashboard over Wi-Fi. No host computer.',
    dates: 'May 2026',
    kind: 'embedded',
    bullets: [
      'Reads temperature and humidity from a DHT11 and shows live readings on a 16×2 LCD over I2C.',
      "Runs an HTTP server directly on the Pico 2 W's RP2350 (Arm Cortex-M33), serving a real-time dashboard to any browser on the network.",
      'Shares a single event loop between sensor polling, LCD updates, and TCP sockets on a constrained target.',
    ],
    tags: ['Raspberry Pi Pico 2 W', 'MicroPython', 'I2C', 'DHT11', 'Wi-Fi'],
    links: [],
  },
  {
    name: 'BISONplan',
    slug: 'bisonplan',
    tagline: 'A course planner for UManitoba students, built on live registration data.',
    dates: 'May 2026 – Present',
    kind: 'software',
    stats: ['500+ users', '2k+ page views', '50k+ requests in month one'],
    bullets: [
      "Proxies the university's Aurora (Banner SSB) registration system live instead of mirroring stale data.",
      'Stays usable during upstream outages by serving age-stamped cached results behind freshness banners.',
      'Guards schedule correctness with interval-overlap and date-range conflict detection, backed by 170+ tests in a 6-job CI pipeline.',
    ],
    tags: ['Python', 'FastAPI', 'React', 'Docker', 'Railway', 'GitHub Actions'],
    links: [
      { label: 'live site', href: 'https://bisonplan.vercel.app' },
      { label: 'github', href: 'https://github.com/yuvixmahar/BISONPlan' },
    ],
    detail: {
      problem: [
        "Planning a term at the University of Manitoba means working in Aurora, the university's registration system. " +
          'It is slow to search, awkward for comparing sections, and has no way to sketch a weekly schedule before you register.',
        'Tools that copy the course catalogue once go stale, so their seat counts and waitlists are wrong exactly when students need them: during registration.',
      ],
      features: [
        'Searches live Aurora data: terms, subjects, sections, seats, and waitlists.',
        'Filters by credits, course level, campus, delivery mode, schedule type, day, time, and instructor.',
        'Shows open / waitlist / full seat badges, plus a quick-view drawer with times, rooms, instructors, and notes.',
        "Loads prerequisites on demand in Aurora's own wording, so nothing gets paraphrased wrong.",
        'Adds any section to a Fall, Winter, or Summer planner and lays it out on a weekly grid.',
        'Blocks a section that clashes with one already in the planner, before it is added.',
        "Saves the planner in the browser and exports a term's schedule as a text file.",
      ],
      flow: {
        nodes: [
          { title: 'React frontend', detail: 'search, filters, weekly planner · Vercel' },
          { title: 'FastAPI backend', detail: 'Docker on Railway · per-IP rate limit' },
          { title: 'shared cache', detail: 'one entry per course + term · 5, 10, or 60 min' },
          { title: 'Aurora (Banner SSB)', detail: "UManitoba's registration system", external: true },
        ],
        edges: ['REST / JSON', 'check first', 'only on a miss'],
        footnote:
          'If Aurora errors or times out, the API returns the last cached copy marked stale with its timestamp, and the UI shows a freshness banner.',
      },
      media: [
        {
          kind: 'video',
          src: 'projects/bisonplan/demo.mp4',
          start: 3, // skip BISONplan's disclaimer modal
          alt: 'Demo of searching for a course and adding it to the weekly planner',
          caption: 'demo · search → planner',
        },
        {
          src: 'projects/bisonplan/search.png',
          alt: 'Course search for Winter 2027 COMP courses, filtered by level, credits, campus, day, and time, showing a section with a limited-seats badge',
          caption: 'course search · filters + live seat counts',
        },
        {
          src: 'projects/bisonplan/planner.png',
          alt: 'Weekly planner showing COMP 2400, COMP 2140, and MATH 1240 laid out on a Monday to Sunday grid',
          caption: 'weekly planner · week-by-week calendar grid',
        },
      ],
      stack: [
        { name: 'Python · FastAPI', why: 'async API that proxies Aurora, with httpx for the upstream calls' },
        { name: 'React · Vite · Tailwind', why: 'the search UI and the weekly planner' },
        { name: 'TTL cache', why: 'shared per course and term, so repeat searches never reach Aurora' },
        { name: 'slowapi', why: 'per-IP rate limiting, so one client cannot turn into load on the university' },
        { name: 'Docker · Railway · Vercel', why: 'backend container on Railway, frontend on Vercel' },
        { name: 'pytest · Vitest · Playwright', why: 'unit tests on both sides plus end-to-end browser tests' },
        {
          name: 'GitHub Actions',
          why: '6 CI jobs on every push: lint, tests, build, e2e, npm audit, Docker image build',
        },
      ],
      role: 'Solo project. I designed it, built the backend and frontend, set up CI and deployment, and run it in production.',
      challenges: [
        {
          title: 'Being a good guest on university servers',
          body:
            'BISONplan never polls or scrapes Aurora on a timer. It fetches only when a student searches, and caches each course and term for everyone, ' +
            'so 50 students opening COMP 1010 in the same window cause one Aurora request. The cache window drops to 5 minutes during add/drop, ' +
            'stretches to 60 once schedules are locked, and lengthens overnight. Every request carries a User-Agent that names the project and gives a contact address.',
        },
        {
          title: 'Staying up when Aurora is down',
          body:
            'When Aurora times out or errors, the API answers with the last cached copy, marked stale with the time it was fetched. ' +
            'The UI shows a freshness banner instead of an error page, so students can keep planning.',
        },
        {
          title: 'Getting conflicts right',
          body:
            'A section can meet several times a week, and summer courses run in different date ranges. ' +
            'The planner flags overlapping meeting times on the same day only when the two date ranges also overlap, ' +
            'so two half-term summer courses in the same time slot are allowed.',
        },
      ],
      results: [
        '500+ users and 2,000+ page views since launch.',
        '50k+ API requests in the first month.',
        '170+ automated tests across backend, frontend, and end-to-end, run by 6 CI jobs on every push.',
      ],
    },
  },
  {
    name: 'JobRadar',
    slug: 'jobradar',
    tagline: 'Watches company career sites and notifies you when a matching job is posted.',
    dates: 'Jul 2026 – Present',
    kind: 'software',
    stats: ['10 job sources', '230 tests', '95% coverage'],
    bullets: [
      "One adapter per platform, not per company: Workday, Greenhouse, Lever, Ashby, SmartRecruiters, Recruitee, Breezy, and Workable, plus Amazon's and AMD's own career sites. All are plugins behind JobSource/Notifier interfaces.",
      'Fetches every source concurrently with asyncio under a semaphore cap, so one failing source never sinks a run.',
      'Deduplicates postings with a SQLite primary key and one batched INSERT OR IGNORE per poll; strict mypy and fully mocked HTTP in tests.',
    ],
    tags: ['Python', 'asyncio', 'httpx', 'SQLite', 'Typer', 'Pydantic'],
    links: [{ label: 'github', href: 'https://github.com/yuvixmahar/job-radar' }],
  },
]

// Career signal markers, evenly spaced left to right. `next` sits in the
// dimmed future zone at the right edge of the scope. Clicking a marker
// scrolls to `target`.
export type Milestone = { when: string; label: string; target?: string; next?: boolean }

export const milestones: Milestone[] = [
  { when: '2022', label: 'started computer engineering @ UManitoba', target: 'about' },
  { when: '2024', label: 'joined UManitoba Robotics', target: 'about' },
  { when: '2025', label: 'swe intern @ Quark Power', target: 'experience' },
  { when: '2026', label: 'built the wireless environmental monitor', target: 'projects' },
  { when: '2026', label: 'launched BISONplan', target: 'projects' },
  { when: '2026', label: 'controls intern @ Winnipeg School Division', target: 'experience' },
  { when: '2026', label: 'started JobRadar', target: 'projects' },
  { when: 'next', label: 'ai / ml · in progress', next: true },
]

// skills.pinout: a DIP-16 chip. Left pins run 1–8 top to bottom, right pins
// 16–9 top to bottom (standard DIP numbering). `dev` = still learning.
export type Pin = { name: string; detail: string; dev?: boolean }

export const chip = {
  part: 'YS-CE28',
  left: [
    { name: 'C', detail: 'firmware · esp32 · stm32 hal' },
    { name: 'C++', detail: 'ros2 nodes · bno055 imu over i2c' },
    { name: 'Python', detail: 'fastapi · asyncio · micropython' },
    { name: 'TypeScript', detail: 'react frontends · quark power' },
    { name: 'FastAPI', detail: 'rest apis · jwt · background tasks' },
    { name: 'React', detail: 'BISONplan · vite · tailwind' },
    { name: 'SQL', detail: 'mysql · postgres · sqlite · alembic' },
    { name: 'Linux', detail: 'ubuntu · nginx · systemd' },
  ] satisfies Pin[],
  right: [
    { name: 'MCU', detail: 'esp32 · stm32 · rp2350' },
    { name: 'CAN', detail: 'esp32 gripper controller over can bus' },
    { name: 'I2C', detail: 'lcds · imus · sensors · also uart and spi' },
    { name: 'ROS2', detail: 'c++ publisher nodes · sensor_msgs/Imu' },
    { name: 'Docker', detail: 'alpine containers · railway deploys' },
    { name: 'Git', detail: 'github actions ci · code review' },
    { name: 'numpy', detail: 'learning · arrays · vectorization', dev: true },
    { name: 'pandas', detail: 'learning · dataframes · cleaning', dev: true },
  ] satisfies Pin[],
  firmware: { file: 'ai-ml.bin', percent: 18, done: ['numpy', 'pandas'], todo: ['sklearn', 'pytorch'] },
}

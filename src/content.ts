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
    "Computer engineering student at the University of Manitoba. I like software that touches hardware: " +
    'firmware on microcontrollers, and the backends and tools around them.',
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

export type Project = {
  name: string
  tagline: string
  dates: string
  kind: 'embedded' | 'software'
  stats?: string[]
  bullets: string[]
  tags: string[]
  links: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    name: 'Wireless Environmental Monitor',
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
    tagline: 'A course planner for UManitoba students, built on live registration data.',
    dates: 'May 2026 – Present',
    kind: 'software',
    stats: ['450+ users', '50k+ API requests', 'month one'],
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
  },
  {
    name: 'JobRadar',
    tagline: 'Watches company career sites and notifies you when a matching job is posted.',
    dates: 'Jul 2026 – Present',
    kind: 'software',
    stats: ['8 ATS adapters', '230 tests', '95% coverage'],
    bullets: [
      'One adapter per ATS platform, not per company: Workday, Greenhouse, Lever, Ashby, SmartRecruiters, Recruitee, Breezy, and Workable, all plugins behind JobSource/Notifier interfaces.',
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

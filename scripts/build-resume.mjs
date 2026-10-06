// Render resume/resume.html to public/Yuvraj_Singh_Resume.pdf with a local
// Chromium browser (Edge or Chrome) in headless print mode.
//
//   npm run resume

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)

const browser = candidates.find((p) => existsSync(p))
if (!browser) {
  console.error('No Edge/Chrome found. Set CHROME_PATH to a Chromium-based browser.')
  process.exit(1)
}

const src = pathToFileURL(resolve('resume/resume.html')).href
const out = resolve('public/Yuvraj_Singh_Resume.pdf')

execFileSync(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${out}`,
  src,
])
console.log(`wrote ${out}`)

# yuvixmahar.github.io

Personal portfolio of **Yuvraj Singh**, a computer engineering student at the University of Manitoba working on software and embedded systems.

The site is styled like a bench oscilloscope. The career timeline is a live signal you can bend with the mouse, skills are the pins of a chip that decode over UART on a second channel, and the portrait is drawn on an LED matrix.

## Stack

React 19, TypeScript (strict), and Vite. Everything animated is plain `<canvas>` with no animation libraries, and it respects `prefers-reduced-motion`.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
npm run lint      # oxlint
npm run resume    # render resume/resume.html to public/Yuvraj_Singh_Resume.pdf (needs Edge or Chrome)
```

## Content

All text lives in [`src/content.ts`](src/content.ts): experience, projects, milestones, and chip pins.

## Portrait

`public/portrait.bin` is a 220×240 grid of brightness values, generated from a photo by
[`scripts/make_portrait.py`](scripts/make_portrait.py). The source photo is not committed.

```bash
uv run --no-project --with pillow python scripts/make_portrait.py --preview
uv run --no-project --with pillow python scripts/make_og.py   # social preview card, public/og.png
```

## Deploy

Pushing to `main` builds the site and publishes it to GitHub Pages via `.github/workflows/deploy.yml`.

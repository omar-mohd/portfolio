# Omar Mohamed Swaleh — portfolio

React + Vite + three.js + Motion. JavaScript, plain structured CSS, no UI kit.

```bash
npm install
npm run dev              # local development
npm run build            # production build in dist/ (deploy this to Vercel, Netlify, GitHub Pages)
SINGLE=1 npm run build   # everything inlined into a single dist/index.html
```

## Where things are

```
src/
  content.js            every word on the site: edit this, not the components
  App.jsx
  components/
    Welcome.jsx         first-visit multilingual welcome (skippable, remembered)
    PullString.jsx      the pull-cord theme switch (spring physics, drag / click / keyboard)
    Hologram.jsx        loads three.js on demand and mounts the hologram
    Background.jsx      grid, particles and ambient light on one 2D canvas
    Nav.jsx
  hologram/
    createHologram.js   the point-cloud scene and its shader
  sections/             Hero, About, Skills, Projects, Experience, Education, Direction, Contact
  styles/               tokens.css (colours, type scale), base, components, sections
  assets/               portrait and certificate images go here
```

## Things to add

| What | How |
| --- | --- |
| A different portrait | Replace `src/assets/portrait.webp` (png, jpg and webp all work) with a photo whose background has been removed. It is picked up automatically. Delete the file to get the waving stand-in figure back. |
| More certificates | Put the image in `src/assets/`, import it at the top of `content.js`, and add an entry to the `certificates` array (name, kind, issuer, date, image). |
| GitHub | Set `person.github` in `content.js`. Project `github` / `demo` fields work the same way: links appear only when filled in. |

## Hologram upgrade path

A photograph is a flat image. It carries no skeleton and no facial rig, so on its own it cannot blink, smile or wave. What this site does today:

- **No portrait yet:** a procedural half-figure made of ~16,000 points (6,000 on phones). It has a jointed arm, so it really does wave on arrival and when clicked.
- **With a portrait (current):** your cut-out photo is drawn as a curved sheet of blue light with scan lines, a sweeping band, flicker and a dissolve at the bottom, with points of light scattered over it. It turns with the cursor and floats. It looks like you. It does not wave or blink.

For the full effect (your likeness, waving, blinking, smiling) you need a rigged model:

1. Create an avatar from your photo with a tool that exports a rigged GLB with facial blend shapes (Avaturn or a similar photo-to-avatar service), or commission one.
2. Add a wave animation (Mixamo provides one for free) and confirm the model has `eyeBlinkLeft/Right` and `mouthSmile` blend shapes.
3. Compress it (`npx gltf-transform optimize in.glb out.glb --compress draco --texture-compress webp`); aim for under 2 MB.
4. In `createHologram.js`, load it with `GLTFLoader`, play the wave clip through an `AnimationMixer`, drive the blink and smile through `morphTargetInfluences`, and apply the same shader idea as a fresnel-plus-scan-line material on the mesh. If the scene grows beyond that, this is the point where moving it to React Three Fiber and Drei pays off.

## Notes

- The welcome runs once per browser (`localStorage`), with a "Replay the welcome" link in the footer.
- Theme choice is remembered. Where supported, the change spreads from the pull knob using the View Transitions API.
- `prefers-reduced-motion` is respected: one welcome word, no drifting background, a still hologram, an instant theme switch.
- The font (Archivo, variable width and weight) is bundled, so nothing is fetched from a third party.

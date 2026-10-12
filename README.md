<p align="center">
  <a href="https://mywestlord.github.io/touch-gregg/"><img src="assets/social-preview.png" alt="Touch Gregg" width="100%"></a>
</p>

<h1 align="center">Touch Gregg</h1>

<p align="center">
  <b>Pet the egg. Watch it hatch. Keep petting Gregg.</b><br>
  <a href="https://mywestlord.github.io/touch-gregg/"><b>▶ Play it in your browser</b></a>
</p>

<p align="center">
  <img src="assets/demo.gif" alt="A hand cursor pets a spotted egg until it hatches into Gregg" width="420">
</p>

---

There is an egg in a field. You pet it. It likes that.

Pet it enough and it starts to crack. Keep going and something hatches. His name is **Gregg** (two g's, because egg). He wears his own shell as a hat and he would like more pets, please.

## What's in the field

- **A tiny hand instead of your cursor.** It brushes the grass aside as you move, and it pets whatever it touches.
- **Morning, Golden and Night.** Switch the time of day at the top. Night has fireflies.
- **Three cracks, one hatch.** 24 pets crack the egg open. Gregg flips out and catches his own shell.
- **Gregg reacts.** He follows your hand with his eyes, closes them when you pet him and blushes.
- **Secrets.** Something happens every 12 pets. Something else happens at 40.
- **He remembers you.** Your Gregg is saved in your browser. Want a fresh one? Hit *New egg*.

Works with a mouse, a trackpad or a finger.

## Made entirely in code

No game engine, no 3D library, no image files for the scene, no audio files.

- Every blade of grass, the egg, Gregg, the sky and the fireflies are drawn with the Canvas 2D API, frame by frame.
- Every sound (pats, cracks, the pop, Gregg's chirps, the *boing*) is synthesized live with the Web Audio API.
- The whole thing is two scripts: [`gregg.js`](gregg.js) draws the egg and Gregg, [`app.js`](app.js) runs the field, the petting and the sounds.

Gregg, his egg, the site, the banners and the launch video were all made by **Claude Opus 5.5**.

## Run it locally

```bash
git clone https://github.com/MyWestLord/touch-gregg
cd touch-gregg
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly works too.

## Assets

| File | What it is |
| --- | --- |
| `assets/avatar-gregg.png` | 1024×1024 avatar of Gregg |
| `assets/avatar-egg.png` | 1024×1024 avatar of the egg at night |
| `assets/banner-x.png` | 1500×500 header for X |
| `assets/social-preview.png` | 1280×640 link preview / GitHub social preview |

## License

Code: [MIT](LICENSE). Fonts: [Inter](https://github.com/rsms/inter), SIL Open Font License 1.1 (see `fonts/LICENSE-Inter.txt`).

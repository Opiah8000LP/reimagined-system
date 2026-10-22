# RDweeb

My portfolio: breakcore / dreamcore on the outside, plain HTML, CSS and JavaScript on the inside. Live at [rdweeb.xyz](https://rdweeb.xyz).

Seven real pages (home, portfolio, services, contact, support, settings, credits), a music player that the background listens to, and the whole interface in English, Russian and German. No frameworks, no build step, no trackers (the only thing it talks to is a GoatCounter visit counter).

## Make it yours

Almost everything you will ever edit is in `config/`:

- `config/site.js`: name, links, services and their open / soon / closed status, prices, projects, support links, credits, short links
- `config/playlist.js`: the songs (put files in `music/`, covers in `covers/`)
- `js/strings.js`: every word of the interface in the three languages

Texts that can be translated look like `{ en: '', ru: '', de: '' }`. Cards marked `sample: true` show a `[ sample ]` tag until you delete that line.

The Contact page has an owner panel where you can type in a new account and get the line to paste into `config/site.js`.

## Run it

Browsers block ES modules on `file://`, so use a tiny server:

```
python3 -m http.server
```

then open http://localhost:8000. On GitHub Pages it just works (the `CNAME` file points at rdweeb.xyz, delete it if you use another domain).

## Using it for your own site

You are welcome to. The code is MIT, see `LICENSE`: keep the licence notice, change the names, make it yours, and don't take it as a reason to claim you wrote the original. The music, covers and `og.png` are not covered and are not free to reuse, replace them with your own.

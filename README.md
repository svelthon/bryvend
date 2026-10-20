# Bryvend

Bryvend, the Brython that Bryntime and Bryc run on, with its fixes, until upstream
Brython carries them.

```js
import 'bryvend';          // the runtime, started
import 'bryvend/compiler'; // the parsing chain, after it
```

Brython was written as a classic `<script>`; `start/` runs it as an ES module,
in a page or under Node: what it finds of a page (`page.js`), then the engine
started (`engine.js`).

Each difference from upstream Brython, and its PR, is in
[BRYTHON_FIX.md](BRYTHON_FIX.md). Rebuilt from a Brython checkout by
`python3 scripts/vendor-brython.py <checkout>`. BSD-3-Clause, as Brython.

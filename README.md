# Bryve

Bryve, the Brython that Bryntime and Bryc run on, with its fixes, until upstream
Brython carries them.

```js
import 'bryve';          // the runtime
import 'bryve/compiler'; // the parsing chain, after it
```

Each difference from upstream Brython, and its PR, is in
[BRYTHON_FIX.md](BRYTHON_FIX.md). Rebuilt from a Brython checkout by
`python3 scripts/vendor-brython.py <checkout>`. BSD-3-Clause, as Brython.

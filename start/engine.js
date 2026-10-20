// The engine started, as a page's `brython()` starts it, outside the classic
// `<script>` brython.js was written for: what it finds of a page first
// (`page.js`), then the runtime, without its parsing chain, which a page that
// runs code compiled ahead of time never needs and a compiler adds after
// (`bryvend/compiler`). This is the module `bryvend` names.
//
// Imported here and not left to the order of whoever imports this: each runs
// where it is imported, in the order written, and naming the dependency where
// it is needed is what keeps the order.
import './page.js';
import '../brython_runtime.js';

const $B = globalThis.__BRYTHON__;

// page.js shadowed `process` so that brython.js would see the DOM jsdom
// provides rather than the Node process behind it. Its load is over.
if ($B.$bryvendRealProcess) {
    globalThis.process = $B.$bryvendRealProcess;
    delete $B.$bryvendRealProcess;
}

// What brython.js adds to the global scope when it finds no browser.
const DOM_STUBS = new Set(['document', 'location', 'HTMLElement', 'MutationObserver', 'customElements']);

// Once per page. `ipy_id: []` keeps brython() from scanning the document for
// <script type="text/python">: the Python run here is compiled ahead of time,
// there is nothing left to find.
if (!$B.$bryvendStarted) {
    $B.$bryvendStarted = true;
    $B.brython({ ipy_id: [] });

    // Server rendering must look like server rendering. Brython's DOM stubs did
    // their job during the bootstrap above; leaving them in place makes every
    // library that tests `typeof document` take the browser path and fail on
    // `window`. See the note in page.js.
    const before = $B.$bryvendGlobalsBefore;

    if (before && !before.has('window')) {
        for (const name of Object.getOwnPropertyNames(globalThis)) {
            if (!before.has(name) && DOM_STUBS.has(name)) delete globalThis[name];
        }
    }
}

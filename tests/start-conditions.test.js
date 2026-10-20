// @vitest-environment node
//
// The condition, not just the cleanup.
//
// Brython's DOM stubs are gone after the bootstrap on a server, and a server's
// rendering depends on it. What nothing asked is whether they go **under the right
// condition** — and the condition is the whole point of the block, which exists
// to leave a real browser's globals alone. Measured by mutation: turn either
// `&&` of the cleanup in `engine.js` into `||` and not one other test notices.
// A coverage figure is a floor on *lines*; the defects keep living in
// *conditions*.
//
// Three scenarios, one child process each, because the decision runs once per
// process and reads a set recorded before Brython loads. The server case is the
// witness: it is what a server's rendering holds, and if it ever goes green
// while the other two do, the bench is measuring nothing.
import { test, expect, describe } from 'vitest';
import { execFileSync } from 'node:child_process';

const STUBS = ['document', 'location', 'HTMLElement', 'MutationObserver', 'customElements'];

// Asked once, because spawning is not everyone's to do: under a sandbox that
// forbids it these four come back as `spawnSync … EPERM`, a red that says
// nothing about the code. A run that cannot spawn says *that* instead, and the
// guard still holds everywhere a process can be made.
const canSpawn = (() => {
    try {
        execFileSync(process.execPath, ['-e', ''], { stdio: 'ignore' });

        return true;
    } catch {
        return false;
    }
})();

const start = (scenario) =>
    JSON.parse(
        execFileSync(process.execPath, ['tests/fixtures/start-globals.mjs', scenario], {
            encoding: 'utf8'
        })
    );

describe.skipIf(!canSpawn)('what the bootstrap cleanup is allowed to remove', () => {
    // The witness. Off a browser, everything Brython laid down goes.
    test('off a browser, the stubs are gone', () => {
        const after = start('server');

        for (const name of STUBS) {
            expect(after[name], `${name} must not survive server rendering`).toBe('undefined');
        }
    });

    // `before && !before.has('window')`. In a page these globals belong to the
    // document, and a Brython that polyfilled a missing one polyfilled it for
    // the page, not for us.
    test('in a browser, nothing is removed at all', () => {
        const after = start('browser');

        for (const name of STUBS) {
            expect(after[name], `${name} belongs to the page`).not.toBe('undefined');
        }
    });

    // `!before.has(name) && DOM_STUBS.has(name)`, both halves. The host's own
    // `HTMLElement` carries a stub's name and was not ours to add; `__witness`
    // was added after the recording and is not a stub name.
    test('a name the host already owned is not ours to remove', () => {
        expect(start('hosted').element).toBe('Mine');
    });

    test('a name added after the recording, that is not a stub, stays', () => {
        for (const scenario of ['server', 'browser', 'hosted']) {
            expect(start(scenario).witness, `witness in ${scenario}`).toBe('mine');
        }
    });

    // **Bryve runs alone**, as its README says: `import 'bryve'`, then
    // `import 'bryve/compiler'`, in a process that loads nothing else, and
    // Python compiles and runs.
    test('imported by its name in an empty process, it starts, compiles Python and runs it', () => {
        const program = [
            "import 'bryve';",
            "import 'bryve/compiler';",
            "const src = 'print(sum(i * i for i in range(10)), [n ** 2 for n in range(4)])\\n';",
            "new Function(globalThis.__BRYTHON__.py2js({ src, filename: 'alone.py' }, 'alone', ['alone']).to_js())();"
        ].join('\n');

        expect(execFileSync(process.execPath, ['--input-type=module', '-e', program], { encoding: 'utf8' }).trim()).toBe('285 [0, 1, 4, 9]');
    });
});

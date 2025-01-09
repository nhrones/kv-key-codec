import { pack, unpack } from './src/mod.ts'
import * as TestKey from './testKeySet.ts'

/** set this to the test key to be tested */
const testKey = TestKey.MultiPart

// then,    deno run app.ts
// we'll encode, then decode this test key
const packed = pack(testKey.key) 
const unpacked = unpack(packed)
//@ts-ignore ?
if (Array.isArray(testKey.key)) testKey.key = `[${testKey.key}]`

// we'll next report the test results
console.log (`encoding ${testKey.name} - ${testKey.key}
returned - [${packed}]
expected = ${testKey.expect}
decoded to: ${unpacked}
`);
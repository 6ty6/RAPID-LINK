import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import {fileURLToPath} from 'node:url'
const path=value=>fileURLToPath(new URL(value,import.meta.url))
export default defineConfig({
 plugins:[react()],
 resolve:{alias:[{find:/^sanity$/,replacement:path('./tests/cms/sanityMock.js')},{find:/^react$/,replacement:path('./node_modules/react/index.js')}]},
 test:{include:['tests/cms/**/*.test.jsx'],environment:'jsdom',setupFiles:'./src/test/setup.js',css:true},
})

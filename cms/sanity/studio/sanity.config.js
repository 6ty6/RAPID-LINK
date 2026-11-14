import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from '../schemaTypes/index.js'

export default defineConfig({
  name: 'rapidlink-cms-evaluation',
  title: 'RapidLink CMS Evaluation',
  projectId: '04unhu7g',
  dataset: 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})

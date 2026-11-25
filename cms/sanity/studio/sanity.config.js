import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from '../schemaTypes/index.js'
import { structure } from './structure.js'
import { rapidLinkTheme } from './theme.js'
import { RapidLinkIcon, RapidLinkNavbar } from './RapidLinkBrand.jsx'
import {remainingCms} from '../../../src/content/remainingCms.js'
const singletonTypes=['siteSettings','loanCalculatorSettings','sharedSettings','digitalChannelsPage','loanCalculatorPage',...Object.values(remainingCms).filter(model=>!model.collection).map(model=>model.schema)]

export default defineConfig({
  name: 'rapidlink-cms-evaluation',
  title: 'RapidLink Content Studio',
  icon: RapidLinkIcon,
  projectId: '04unhu7g',
  dataset: 'production',
  theme: rapidLinkTheme,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    templates: templates => templates.filter(template => !singletonTypes.includes(template.schemaType)),
  },
  document: {
    actions: (actions, context) => singletonTypes.includes(context.schemaType)
      ? actions.filter(action => !['delete', 'duplicate'].includes(action.action))
      : actions,
  },
  studio: {
    components: { navbar: RapidLinkNavbar },
  },
})

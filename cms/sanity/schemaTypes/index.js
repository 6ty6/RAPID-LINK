import { careerVacancy } from './careerVacancy'
import { faq } from './faq'
import { impactCounter } from './impactCounter'
import { newsArticle } from './newsArticle'
import { announcement } from './announcement'
import { siteSettings } from './siteSettings'
import { loanCalculatorSettings } from './loanCalculatorSettings'
import { sharedSettings } from './sharedSettings'
import { digitalChannelsPage } from './digitalChannelsPage'
import { loanCalculatorPage } from './loanCalculatorPage'
import {remainingContentTypes} from './remainingContent'
export const schemaTypes = [
  newsArticle,
  careerVacancy,
  faq,
  impactCounter,
  announcement,
  siteSettings,
  loanCalculatorSettings,
  sharedSettings,
  digitalChannelsPage,
  loanCalculatorPage,
  ...remainingContentTypes,
]

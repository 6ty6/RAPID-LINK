import {useLocation} from 'react-router-dom'
import usePageContent from './usePageContent.js'
import {remainingCms} from '../content/remainingCms.js'
export default function useEditorialPage(){
 const {pathname}=useLocation()
 const {data}=usePageContent('pages')
 const slug=pathname.replace(/^\//,'').replace(/\/$/,'')
 return data.find(page=>page.slug===slug) || remainingCms.pages.content.find(page=>page.slug===slug)
}

import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import RouteEffects from './components/RouteEffects'
import Home from './pages/Home'
import OpenAccount from './pages/OpenAccount'
import { ApplyLoan, LoanCalculator } from './pages/Loans'
import { ProductPage, RateChart, Rates } from './pages/Products'
import CareerManagement from './pages/CareerManagement'
import AcceptInvite from './pages/AcceptInvite'
import {
  Careers,
  Contact,
  DigitalChannels,
  FAQs,
  InstitutionalProfile,
  PeoplePage,
  Stories,
  StoryArticle,
} from './pages/Information'

export default function App() {
  return <>
    <RouteEffects />
    <Header />
    <main id="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/apply-loan" element={<ApplyLoan />} />
        <Route path="/open-account" element={<OpenAccount />} />
        <Route path="/institutional-profile" element={<InstitutionalProfile />} />
        <Route path="/board-of-directors" element={<PeoplePage />} />
        <Route path="/digital-channels" element={<DigitalChannels />} />
        <Route path="/rates" element={<Rates />} />
        <Route path="/rate-chart" element={<RateChart />} />
        <Route path="/loan-calculator" element={<LoanCalculator />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/stories/:slug" element={<StoryArticle />} />
        <Route path="/rapidlink-careers" element={<Careers />} />
        <Route path="/content-management" element={<CareerManagement />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/career-management" element={<Navigate to="/content-management" replace />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/*" element={<ProductPage />} />
      </Routes>
    </main>
    <Footer />
  </>
}

function Icon({ children, size = 24, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
}
export const ArrowRight = props => <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>
export const ChevronLeft = props => <Icon {...props}><path d="m15 18-6-6 6-6"/></Icon>
export const ChevronRight = props => <Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>
export const ChevronDown = props => <Icon {...props}><path d="m6 9 6 6 6-6"/></Icon>
export const Check = props => <Icon {...props}><path d="m5 12 4 4L19 6"/></Icon>
export const X = props => <Icon {...props}><path d="M18 6 6 18M6 6l12 12"/></Icon>
export const Menu = props => <Icon {...props}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>
export const CircleAlert = props => <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 17h.01"/></Icon>
export const Info = props => <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></Icon>
export const Phone = props => <Icon {...props}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 13 13 0 0 0 2.9.7 2 2 0 0 1 1.6 1.9Z"/></Icon>
export const Smartphone = props => <Icon {...props}><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/></Icon>
export const Landmark = props => <Icon {...props}><path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></Icon>
export const Building2 = props => <Icon {...props}><path d="M3 21h18M6 21V4h9v17M15 9h4v12M9 8h2M9 12h2M9 16h2"/></Icon>
export const Users = props => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>
export const CalendarDays = props => <Icon {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01"/></Icon>
export const WalletCards = props => <Icon {...props}><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6M16 13h2"/></Icon>
export const Briefcase = props => <Icon {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></Icon>
export const MapPin = props => <Icon {...props}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></Icon>
export const Lock = props => <Icon {...props}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></Icon>
export const Search = props => <Icon {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>
export const Eye = props => <Icon {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></Icon>
export const Target = props => <Icon {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></Icon>
export const Download = props => <Icon {...props}><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></Icon>
export const FileText = props => <Icon {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></Icon>

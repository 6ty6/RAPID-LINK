import styled from 'styled-components'

const BrandedNavbar = styled.div`
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, #0831ff 0 86%, #ff7400 86% 100%) 1;
`

export function RapidLinkNavbar(props) {
  return <BrandedNavbar>{props.renderDefault(props)}</BrandedNavbar>
}

export function RapidLinkIcon() {
  return <svg
    aria-label="RapidLink Microfinance"
    role="img"
    viewBox="0 0 64 64"
    width="1em"
    height="1em"
  >
    <rect width="64" height="64" rx="12" fill="#ffffff" />
    <path d="M8 24C15 8 40 5 54 18" fill="none" stroke="#ff7400" strokeWidth="5" strokeLinecap="round" />
    <path d="m54 14 1.8 4 4.4.5-3.3 3 1 4.3-3.9-2.2-3.8 2.2 1-4.3-3.3-3 4.4-.5Z" fill="#ff7400" />
    <text x="13" y="51" fill="#0831ff" fontFamily="Georgia, 'Times New Roman', serif" fontSize="37" fontWeight="700">R</text>
    <path d="M12 55h41" stroke="#0831ff" strokeWidth="3" strokeLinecap="round" />
  </svg>
}

// Existing approved Institutional Profile content, separated from its React
// presentation so it can later be supplied by the selected CMS.
export const institutionalProfileContent = {
  hero: {
    title: 'Our institutional profile',
    introduction: 'A customer-centred deposit-taking microfinance company established in June 2010.',
    image: '/assets/about-institutional-profile.jpg',
    imagePosition: 'center 58%',
  },
  profileParagraphs: [
    {
      segments: [
        { text: 'RapidLink Microfinance Ltd', emphasis: 'strong-italic' },
        { text: ', a registered Non-Bank Financial Institution (Deposit Taking Microfinance Company) established in June 2010, is a trusted and customer-centric force in Ghana’s financial sector. Recognized by the Registrar General’s Department of Ghana, our mission is to transform lives and foster economic empowerment through inclusive and innovative financial services.' },
      ],
    },
    {
      segments: [
        { text: 'In October 2013, we received full authorization from the Bank of Ghana to operate as a licensed Microfinance Company — a milestone that affirms our dedication to regulatory compliance, financial integrity, and sustainable growth. Our headquarters, located in the heart of Accra at ' },
        { text: 'Asylum Down; 17 Farrar Avenue', emphasis: 'strong' },
        { text: ', symbolizes trust, accessibility, and our deep connection with the communities we serve. Over the years, RapidLink has built a strong reputation for providing responsive financial solutions, including savings, personal and group loans, salary advances, susu contributions, and digital banking services.' },
      ],
    },
    {
      segments: [
        { text: 'We are committed to bridging the financial gap for individuals, SMEs, and underserved sectors by offering tailored products that promote stability and progress. With a team of experienced professionals and a forward-thinking approach, RapidLink Microfinance continues to evolve — embracing technology, financial literacy, and customer care as the foundation of our promise to make finance more human, more inclusive, and more empowering.' },
      ],
    },
  ],
  purpose: {
    eyebrow: 'Our purpose',
    title: 'The future we see. The work we do.',
    introduction: 'Explore the vision that guides RapidLink and the mission that moves us forward.',
    cards: [
      {
        title: 'Our Vision',
        prompt: 'Where we are going',
        icon: 'vision',
        text: 'A leading financial institution recognised for innovative solutions, a client-centric approach and commitment to social impact.',
      },
      {
        title: 'Our Mission',
        prompt: 'How we will get there',
        icon: 'mission',
        text: 'To provide accessible, affordable and sustainable financial services to underserved individuals and small businesses, improving quality of life and fostering economic growth.',
      },
    ],
  },
  impact: {
    eyebrow: 'Our reach',
    title: 'Our Impact in Numbers',
    statistics: [
      { target: 2, label: 'Branches Nationwide', icon: 'branches' },
      { target: 7000, suffix: '+', label: 'Happy Customers', icon: 'customers' },
      { target: 15, suffix: '+', label: 'Years of Service', icon: 'years' },
      { target: 5, suffix: '+', label: 'Financial Products', icon: 'products' },
    ],
  },
}

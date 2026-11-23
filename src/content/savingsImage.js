export const savingsImage = {
  image: '/assets/rapid-savings-custom-v1.png',
  imageAlt: 'Illustration of a Ghanaian market woman putting cedi notes into a glass savings jar',
}
export const susuImage = {
  image: '/assets/rapid-susu-growth-v1.png',
  imageAlt: 'Three glass jars with increasing amounts of coins, with a green plant growing from the fullest jar',
}
export const personalLoanImage = {
  image: '/assets/personal-loan-planning-v1.png',
  imageAlt: 'Illustration of a Ghanaian parent planning household expenses with a notebook, calculator and cedi notes',
}
export const businessLoanImage = {
  image: '/assets/business-loan-ghana-sme-v1.jpg',
  imageAlt: 'A Ghanaian seamstress working at a sewing machine in Takoradi',
}
export const fixedDepositImage = {
  image: '/assets/fixed-deposit-term-v1.png',
  imageAlt: 'Illustration of a closed jar of cedi savings beside a calendar and a small potted plant',
}
export const targetSavingsImage = {
  image: '/assets/rapid-target-home-v1.png',
  imageAlt: 'Illustration of a Ghanaian couple planning savings toward a home with a house plan and notebook',
}
export const advantageInvestmentImage = {
  image: '/assets/advantage-market-adviser-v1.png',
  imageAlt: 'Illustration of a Ghanaian market woman in a blouse, wrapper and headscarf discussing an investment with an adviser',
}
export const groupLoanImage = {
  image: '/assets/group-loan-market-v1.png',
  imageAlt: 'Illustration of four Ghanaian market traders discussing a group contribution record with a field officer',
}
export const salaryLoanImage = {
  image: '/assets/deduct-salary-nurse-v1.png',
  imageAlt: 'Illustration of a Ghanaian nurse planning monthly expenses with a notebook, payslip and calculator',
}

// Refresh only the specifically selected legacy images. Staff uploads remain
// authoritative; this does not write to the CMS or change any product terms.
export function refreshSavingsImage(record) {
  if (record.kind === 'product' && record.slug === 'deduct-at-source-loan' && record.image === '/assets/deduct-loan.jpg') return { ...record, ...salaryLoanImage }
  if (record.kind === 'product' && record.slug === 'group-loan' && record.image === '/assets/group-loan.jpg') return { ...record, ...groupLoanImage }
  if (record.kind === 'product' && record.slug === 'advantage-investment' && record.image === '/assets/advantage-investment.webp') return { ...record, ...advantageInvestmentImage }
  if (record.kind === 'product' && record.slug === 'rapid-target-savings' && record.image === '/assets/rapid-target-savings.webp') return { ...record, ...targetSavingsImage }
  if (record.kind === 'product' && record.slug === 'fixed-deposit' && record.image === '/assets/fixed-deposit.webp') return { ...record, ...fixedDepositImage }
  if (record.kind === 'product' && record.slug === 'business-loan' && record.image === '/assets/business-loan.jpg') return { ...record, ...businessLoanImage }
  if (record.kind === 'product' && record.slug === 'personal-loan' && record.image === '/assets/personal-loan-public.webp') return { ...record, ...personalLoanImage }
  if (record.kind === 'product' && record.slug === 'rapid-susu' && record.image === '/assets/rapid-susu.jpg') return { ...record, ...susuImage }
  return record.kind === 'product' && record.slug === 'rapid-savings' && record.image === '/assets/rapid-savings.jpg'
    ? { ...record, ...savingsImage }
    : record
}

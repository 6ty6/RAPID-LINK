export function validateCalculatorSettings(settings) {
  if (!settings || settings.approvalStatus !== 'approved') throw Error('Calculator settings require Credit approval.')
  const positive = ['minimumPrincipal','maximumPrincipal','minimumMonths','maximumMonths']
  if (positive.some(key => !Number.isFinite(settings[key]) || settings[key] <= 0) ||
      settings.minimumPrincipal > settings.maximumPrincipal || settings.minimumMonths > settings.maximumMonths ||
      !Number.isInteger(settings.minimumMonths) || !Number.isInteger(settings.maximumMonths) || settings.maximumMonths > 60) throw Error('Invalid loan limits.')
  const rates = ['monthlyFlatRate','nominalAnnualRate','processingFeeRate','insuranceFeeRate','managementFeeRate','earlySettlementRate']
  if (rates.some(key => !Number.isFinite(settings[key]) || settings[key] < 0 || settings[key] > 100)) throw Error('Invalid loan rates.')
  if (settings.excludeFutureInterest !== true) throw Error('Unsupported early settlement method.')
  if (!Array.isArray(settings.repaymentFrequencies) || !settings.repaymentFrequencies.length ||
      settings.repaymentFrequencies.some(value => !['monthly','weekly'].includes(value))) throw Error('Invalid repayment frequencies.')
  if (settings.repaymentFrequencies.includes('weekly')) {
    for (let months = settings.minimumMonths; months <= settings.maximumMonths; months++) {
      const count = settings.weeklyPaymentsByMonth?.[months]
      if (!Number.isInteger(count) || count <= 0) throw Error('Incomplete weekly schedule.')
    }
  }
  if (['heroIntro','disclaimer'].some(key => typeof settings[key] !== 'string' || !settings[key].trim())) throw Error('Missing calculator wording.')
  return settings
}

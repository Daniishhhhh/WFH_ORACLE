import type { Verdict } from './score';

export type Tone = 'corporate' | 'dramatic' | 'desi';

export type ExcuseContext = {
  area: string;
  tone: Tone;
  verdict: Verdict;
  rainProbability: number;
  rainMm: number;
  aqi: number;
  temperatureC: number;
  windSpeedKph: number;
  commutePoints: number;
};

const FALLBACKS: Record<Tone, readonly string[]> = {
  corporate: [
    'Due to {rain}% precipitation risk and an AQI of {aqi}, I will work remotely from {area} today to maintain productivity and reduce commute exposure.',
    'Given the forecasted {rain}% rain probability, {rainMm} mm of precipitation, and AQI {aqi}, I recommend a remote-work arrangement for today.',
    'The {area} commute is currently carrying a {commute} point friction score with AQI {aqi}; I will remain available and deliver my work from home.',
    'To preserve focused delivery during today’s {rain}% rain window and AQI {aqi}, I am requesting a WFH day and will remain online during all working hours.',
    'Weather conditions indicate {rain}% rain probability and {wind} km/h winds around {area}; I will work remotely and keep all meetings and deadlines unchanged.',
    'The combination of {rain}%-likely rain and AQI {aqi} makes remote work the more efficient operating model for today. I will be fully reachable from home.',
    'I am choosing WFH today due to the {area} commute friction score of {commute} and current AQI {aqi}, with no impact expected on planned deliverables.',
    'With {rainMm} mm of expected precipitation and a {rain}% chance of rain, I will work from home today and maintain normal response times.',
    'Today’s local conditions ({rain}% rain probability, AQI {aqi}) support a remote setup. I will be online, accountable, and unusually close to my charger.',
    'For operational efficiency, I will work remotely from {area} today while the forecast manages its {rain}% chance of disruption.',
  ],
  dramatic: [
    'The skies have assigned {rain}% rain to {area}, while AQI {aqi} guards the gates. I shall work from home and protect the deliverables.',
    'With {rainMm} mm of rain waiting in ambush and winds at {wind} km/h, I cannot in good conscience send my laptop into the commute. I remain online.',
    'AQI {aqi} and a {commute}-point commute score have formed an alliance against punctuality. I will be working from home today.',
    'The forecast declares a {rain}% chance of rain, and I have chosen not to challenge its authority. My desk and I will operate remotely.',
    'Today, {area} is a stage, {rain}% rain is the antagonist, and AQI {aqi} is the ominous soundtrack. I will deliver from home.',
    'I have reviewed the {rain}% rain probability and AQI {aqi}; the responsible plot twist is WFH. My calendar remains undefeated.',
    'The commute friction stands at {commute}, the wind reaches {wind} km/h, and the office quest is needlessly perilous. I will work remotely.',
    'The clouds have sent a {rain}% warning and AQI {aqi} has submitted supporting evidence. I am requesting refuge at my home workstation.',
    'A {rain}% rain chance is not a forecast; it is a narrative threat. I will remain at home, online, and dramatically productive.',
    'In light of {rainMm} mm precipitation and AQI {aqi}, I am taking the heroic remote-work route from {area}. The work shall continue.',
  ],
  desi: [
    'Boss, {area} is showing {rain}% rain and AQI {aqi}. I will WFH today, keep Teams on, and avoid making Silk Board part of my personality.',
    'The forecast has {rainMm} mm rain and {wind} km/h wind, so today I am choosing laptop-to-desk, not ORR-to-office. Deliverables will be on time.',
    'AQI {aqi} plus a {commute}-point commute scene is not the vibe, boss. I will work from home and be fully available.',
    'Namma sky is giving {rain}% rain chance, so I am taking the sensible route: WFH from {area} and no unnecessary heroics.',
    'With rain at {rain}% and AQI {aqi}, even my chai says remote work. I will be online for every meeting, promise.',
    'Boss, the commute score is {commute} and the air is AQI {aqi}. Let me work from home today before the traffic starts its stand-up comedy.',
    'Today’s forecast is {rain}% rain, which is Bengaluru for “carry an umbrella and reconsider everything.” I will WFH and keep the work moving.',
    'The clouds have put {rainMm} mm on the agenda and AQI {aqi} is also attending. I am working from home, no drama in the deliverables.',
    '{area} has {rain}% rain probability and {wind} km/h winds. I will be remote today and reachable faster than the namma metro announcement.',
    'Boss, a {commute}-point commute with AQI {aqi} is asking for WFH. I will log in from home and not blame the ORR in the status update.',
  ],
};

function render(template: string, context: ExcuseContext): string {
  return template
    .replaceAll('{area}', context.area)
    .replaceAll('{rain}', String(Math.round(context.rainProbability)))
    .replaceAll('{rainMm}', context.rainMm.toFixed(1))
    .replaceAll('{aqi}', String(Math.round(context.aqi)))
    .replaceAll('{temperature}', context.temperatureC.toFixed(1))
    .replaceAll('{wind}', String(Math.round(context.windSpeedKph)))
    .replaceAll('{commute}', String(Math.round(context.commutePoints)));
}

export function fallbackExcuse(context: ExcuseContext): string {
  const options = FALLBACKS[context.tone];
  const template = options[Math.floor(Math.random() * options.length)];
  const rendered = render(template, context).replace(/[.!?]\s*$/, '');
  return `${rendered}; conditions logged: rain ${Math.round(context.rainProbability)}%, AQI ${Math.round(context.aqi)}, commute friction ${Math.round(context.commutePoints)}.`;
}

export const fallbackBankSize = Object.values(FALLBACKS).reduce((total, excuses) => total + excuses.length, 0);

import { Oracle } from '@/components/oracle';
import { AREAS, getArea } from '@/lib/areas';
import { calculateScore } from '@/lib/score';
import { getOracleData } from '@/lib/weather';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: { area?: string | string[] } }) {
  const selectedArea = getArea(searchParams?.area);
  const data = await getOracleData(selectedArea);
  const result = calculateScore({
    areaHellFactor: selectedArea.hellFactor,
    rainProbability: data.weather.rainProbability,
    rainMm: data.weather.rainMm,
    temperatureC: data.weather.temperatureC,
    aqi: data.airQuality.aqi,
    windSpeedKph: data.weather.windSpeedKph,
    weatherCode: data.weather.weatherCode,
  });

  return <Oracle areas={AREAS} selectedArea={selectedArea} data={data} result={result} />;
}

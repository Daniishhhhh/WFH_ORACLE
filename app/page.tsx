import { Oracle } from '@/components/oracle';
import { AREAS, getArea } from '@/lib/areas';
import { calculateScore } from '@/lib/score';
import { getOracleData } from '@/lib/weather';

export const dynamic = 'force-dynamic';

type HomeSearchParams = { area?: string | string[] };

export default async function Home({ searchParams }: { searchParams: Promise<HomeSearchParams> }) {
  const params = await searchParams;
  const selectedArea = getArea(params.area);
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

import SiteLayout from '../components/SiteLayout';
import OneMeterVsThreeMeterDivingContent from '../components/page-content/OneMeterVsThreeMeterDivingContent';

export default function OneMeterVsThreeMeterDivingPage() {
  return (
    <SiteLayout title={"1-Meter vs. 3-Meter Diving: What Changes? | STL Diving"} description={"The boards look similar, but timing, height, takeoff, and confidence change as athletes move from 1-meter to 3-meter."}>
      <OneMeterVsThreeMeterDivingContent />
    </SiteLayout>
  );
}

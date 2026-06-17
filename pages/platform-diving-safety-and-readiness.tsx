import SiteLayout from '../components/SiteLayout';
import PlatformDivingSafetyAndReadinessContent from '../components/page-content/PlatformDivingSafetyAndReadinessContent';

export default function PlatformDivingSafetyAndReadinessPage() {
  return (
    <SiteLayout title={"Platform Diving Safety and Readiness | STL Diving"} description={"Tower work is exciting, but safe platform progression should always be earned step by step."}>
      <PlatformDivingSafetyAndReadinessContent />
    </SiteLayout>
  );
}

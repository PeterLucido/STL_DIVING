import SiteLayout from '../components/SiteLayout';
import HomeContent from '../components/page-content/HomeContent';

export default function HomePage() {
  return (
    <SiteLayout title={"Home | STL Diving"}>
      <HomeContent />
    </SiteLayout>
  );
}

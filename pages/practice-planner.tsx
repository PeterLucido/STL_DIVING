import SiteLayout from '../components/SiteLayout';
import PracticePlannerContent from '../components/page-content/PracticePlannerContent';

export default function PracticePlannerPage() {
  return (
    <SiteLayout
      title={"Practice Planner | STL Diving"}
      description="Sign in to schedule an intro session or let STL Diving know when an athlete is coming to practice."
      hideFooter
    >
      <PracticePlannerContent />
    </SiteLayout>
  );
}

import SiteLayout from "../components/SiteLayout";
import PracticePlannerConceptsContent from "../components/page-content/PracticePlannerConceptsContent";

export default function PracticePlannerConceptsPage() {
  return (
    <SiteLayout
      title="Practice Planner Concepts | STL Diving"
      description="Five local practice planner layout concepts for STL Diving."
    >
      <PracticePlannerConceptsContent />
    </SiteLayout>
  );
}

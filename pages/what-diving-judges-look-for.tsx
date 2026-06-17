import SiteLayout from '../components/SiteLayout';
import WhatDivingJudgesLookForContent from '../components/page-content/WhatDivingJudgesLookForContent';

export default function WhatDivingJudgesLookForPage() {
  return (
    <SiteLayout title={"What Diving Judges Look For | STL Diving"} description={"Approach, takeoff, flight, entry, and overall control all shape how dives are evaluated."}>
      <WhatDivingJudgesLookForContent />
    </SiteLayout>
  );
}

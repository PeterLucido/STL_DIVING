import SiteLayout from '../components/SiteLayout';
import PracticeAdminContent from '../components/page-content/PracticeAdminContent';

export default function PracticeAdminPage() {
  return (
    <SiteLayout
      title={"Practice Admin | STL Diving"}
      description="Coach view for STL Diving practice schedule submissions."
      hideFooter
    >
      <PracticeAdminContent />
    </SiteLayout>
  );
}

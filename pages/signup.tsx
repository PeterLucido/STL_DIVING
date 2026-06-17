import SiteLayout from '../components/SiteLayout';
import SignupContent from '../components/page-content/SignupContent';

export default function SignupPage() {
  return (
    <SiteLayout title={"Sign Up Instructions | STL Diving"} description={"How to complete USA Diving athlete membership and STL Diving RecPlex registration before getting in the pool."}>
      <SignupContent />
    </SiteLayout>
  );
}

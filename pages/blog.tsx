import SiteLayout from '../components/SiteLayout';
import BlogContent from '../components/page-content/BlogContent';

export default function BlogPage() {
  return (
    <SiteLayout title={"Diving Blog | STL Diving"} description={"Articles about Missouri high school diving, club diving, USA Diving, and Olympic-style diving."}>
      <BlogContent />
    </SiteLayout>
  );
}

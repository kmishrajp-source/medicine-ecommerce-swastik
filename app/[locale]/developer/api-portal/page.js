import ApiPortalClient from './ApiPortalClient';

export const metadata = {
  title: 'Developer API Portal | Swastik Medicare',
  description: 'Integrate Swastik Medicare services into your hospital, clinic, or app. Access our REST APIs for pharmacy, prescription, lab reports, and digital health records.',
};

export default function ApiPortalPage() {
  return <ApiPortalClient />;
}

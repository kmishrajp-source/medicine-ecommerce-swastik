import ConsentClient from './ConsentClient';

export const metadata = {
  title: 'ABDM Consent Manager | Swastik Medicare',
  description: 'Manage who has access to your health records across the Ayushman Bharat Digital Mission (ABDM) network.',
};

export default function ConsentPage() {
  return <ConsentClient />;
}

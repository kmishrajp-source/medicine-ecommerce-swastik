import TimelineClient from './TimelineClient';

export const metadata = {
  title: 'My Health Timeline | Swastik Medicare',
  description: 'View your longitudinal electronic health records (EHR) timeline containing prescriptions, lab reports, and consultations.',
};

export default function HealthTimelinePage() {
  return <TimelineClient />;
}

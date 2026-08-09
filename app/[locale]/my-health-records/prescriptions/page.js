import PrescriptionsClient from './PrescriptionsClient';

export const metadata = {
  title: 'Digital Prescriptions | Swastik Medicare',
  description: 'View and download your digital prescriptions generated through Swastik Medicare.',
};

export default function DigitalPrescriptionsPage() {
  return <PrescriptionsClient />;
}

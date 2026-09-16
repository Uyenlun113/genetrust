import DoctorServicesClient from "./DoctorServicesClient";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function DoctorServicesPage() {
  return <DoctorServicesClient />;
}

import { Suspense } from "react";
import DoctorServicesClient from "../[id]/DoctorServicesClient";

export default function DoctorDetailStaticPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>}>
      <DoctorServicesClient />
    </Suspense>
  );
}

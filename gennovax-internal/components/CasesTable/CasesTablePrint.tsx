"use client";

import type { RefObject } from "react";
import type { CaseRecord } from "@/lib/types";
import { CasePdfTemplate } from "./CasePdfTemplate";

export default function CasesTablePrint({
  printRef,
  printData,
}: {
  printRef: RefObject<HTMLDivElement | null>;
  printData: CaseRecord | null;
}) {
  return (
    <div style={{ display: "none" }}>
      <CasePdfTemplate ref={printRef} data={printData} />
    </div>
  );
}

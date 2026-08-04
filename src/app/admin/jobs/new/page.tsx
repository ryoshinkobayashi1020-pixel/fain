import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createJob } from "../actions";
import JobForm from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/jobs" className="mb-3 flex items-center gap-1 text-sm text-neutral-500">
        <ArrowLeft size={16} /> 案件一覧
      </Link>
      <h1 className="mb-4 text-xl font-black">新規案件を作成</h1>

      <JobForm action={createJob} submitLabel="この内容で案件を掲載する" />
    </div>
  );
}

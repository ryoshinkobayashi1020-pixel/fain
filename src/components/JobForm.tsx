import { JOB_CATEGORIES } from "@/lib/job-categories";

export type JobFormDefaults = {
  title: string;
  clientCompany: string;
  location: string;
  category: string | null;
  workDate: string;
  startTime: string;
  endTime: string;
  hourlyWage: number;
  capacity: number;
  description: string;
};

export default function JobForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: JobFormDefaults;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-neutral-200">
      <Field label="案件名">
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={inputClass}
          placeholder="例: 物流倉庫の仕分け作業"
        />
      </Field>
      <Field label="取引先企業名">
        <input
          name="clientCompany"
          required
          defaultValue={defaultValues?.clientCompany}
          className={inputClass}
          placeholder="例: 株式会社サンプル物流"
        />
      </Field>
      <Field label="勤務地">
        <input
          name="location"
          required
          defaultValue={defaultValues?.location}
          className={inputClass}
          placeholder="例: 東京都江東区"
        />
      </Field>
      <Field label="ジャンル">
        <select name="category" required defaultValue={defaultValues?.category ?? ""} className={inputClass}>
          <option value="" disabled>
            ジャンルを選択してください
          </option>
          {JOB_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="勤務日">
          <input
            name="workDate"
            type="date"
            required
            defaultValue={defaultValues?.workDate}
            className={inputClass}
          />
        </Field>
        <Field label="開始時刻">
          <input
            name="startTime"
            type="time"
            required
            defaultValue={defaultValues?.startTime ?? "09:00"}
            className={inputClass}
          />
        </Field>
        <Field label="終了時刻">
          <input
            name="endTime"
            type="time"
            required
            defaultValue={defaultValues?.endTime ?? "18:00"}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="時給(円)">
          <input
            name="hourlyWage"
            type="number"
            min={0}
            step={10}
            required
            defaultValue={defaultValues?.hourlyWage ?? 1200}
            className={inputClass}
          />
        </Field>
        <Field label="募集人数">
          <input
            name="capacity"
            type="number"
            min={1}
            required
            defaultValue={defaultValues?.capacity ?? 1}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="お仕事内容">
        <textarea
          name="description"
          rows={5}
          required
          defaultValue={defaultValues?.description}
          className={inputClass}
          placeholder="仕事内容、持ち物、集合場所などを記載してください"
        />
      </Field>

      <button type="submit" className="mt-2 w-full rounded-full bg-accent py-3 text-base font-bold text-white">
        {submitLabel}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}

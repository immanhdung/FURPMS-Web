import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Save, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useAcademicProfileQuery, useUpsertAcademicProfileMutation } from "@/hooks/useAcademicProfile";

const academicProfileSchema = z.object({
  academicTitle: z.string().optional(),
  scientificRank: z.string().optional(),
  degreeLevel: z.string().optional(),
  specialization: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  hometown: z.string().optional(),
  nationality: z.string().optional(),
  gsPgsYear: z.number().int().positive().optional().or(z.literal("")),
  gsPgsInstitution: z.string().optional(),
  isiScopusCount: z.number().int().min(0).default(0),
  intlJournalCount: z.number().int().min(0).default(0),
  domesticJournalCount: z.number().int().min(0).default(0),
  intlConferenceCount: z.number().int().min(0).default(0),
  domesticConferenceCount: z.number().int().min(0).default(0),
  patentsCount: z.number().int().min(0).default(0),
  phdSupervisedCount: z.number().int().min(0).default(0),
  masterSupervisedCount: z.number().int().min(0).default(0),
  institution: z.string().optional(),
  institutionAddress: z.string().optional(),
  specializationAreas: z.string().optional(),
});

type AcademicProfileFormValues = z.infer<typeof academicProfileSchema>;

const DEFAULT_COUNTS = {
  isiScopusCount: 0,
  intlJournalCount: 0,
  domesticJournalCount: 0,
  intlConferenceCount: 0,
  domesticConferenceCount: 0,
  patentsCount: 0,
  phdSupervisedCount: 0,
  masterSupervisedCount: 0,
};

interface AcademicProfileCardProps {
  userId: string;
}

function FieldLabel({ htmlFor, children, required }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
}

function CounterField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
    </div>
  );
}

export function AcademicProfileCard({ userId }: AcademicProfileCardProps) {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useAcademicProfileQuery(userId);
  const mutation = useUpsertAcademicProfileMutation(userId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AcademicProfileFormValues>({
    resolver: zodResolver(academicProfileSchema),
    defaultValues: DEFAULT_COUNTS,
  });

  useEffect(() => {
    if (profile) {
      reset({
        academicTitle: profile.academicTitle ?? "",
        scientificRank: profile.scientificRank ?? "",
        degreeLevel: profile.degreeLevel ?? "",
        specialization: profile.specialization ?? "",
        dateOfBirth: profile.dateOfBirth ?? "",
        gender: profile.gender ?? "",
        hometown: profile.hometown ?? "",
        nationality: profile.nationality ?? "Vietnamese",
        gsPgsYear: profile.gsPgsYear ?? ("" as unknown as number),
        gsPgsInstitution: profile.gsPgsInstitution ?? "",
        isiScopusCount: profile.isiScopusCount ?? 0,
        intlJournalCount: profile.intlJournalCount ?? 0,
        domesticJournalCount: profile.domesticJournalCount ?? 0,
        intlConferenceCount: profile.intlConferenceCount ?? 0,
        domesticConferenceCount: profile.domesticConferenceCount ?? 0,
        patentsCount: profile.patentsCount ?? 0,
        phdSupervisedCount: profile.phdSupervisedCount ?? 0,
        masterSupervisedCount: profile.masterSupervisedCount ?? 0,
        institution: profile.institution ?? "",
        institutionAddress: profile.institutionAddress ?? "",
        specializationAreas: profile.specializationAreas ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = (values: AcademicProfileFormValues) => {
    mutation.mutate({
      academicTitle: values.academicTitle || undefined,
      scientificRank: values.scientificRank || undefined,
      degreeLevel: values.degreeLevel || undefined,
      specialization: values.specialization || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      gender: values.gender || undefined,
      hometown: values.hometown || undefined,
      nationality: values.nationality || undefined,
      gsPgsYear: values.gsPgsYear ? Number(values.gsPgsYear) : undefined,
      gsPgsInstitution: values.gsPgsInstitution || undefined,
      isiScopusCount: values.isiScopusCount,
      intlJournalCount: values.intlJournalCount,
      domesticJournalCount: values.domesticJournalCount,
      intlConferenceCount: values.intlConferenceCount,
      domesticConferenceCount: values.domesticConferenceCount,
      patentsCount: values.patentsCount,
      phdSupervisedCount: values.phdSupervisedCount,
      masterSupervisedCount: values.masterSupervisedCount,
      institution: values.institution || undefined,
      institutionAddress: values.institutionAddress || undefined,
      specializationAreas: values.specializationAreas || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl border border-border p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <GraduationCap className="size-4.5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("academicProfile.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("academicProfile.subtitle")}</p>
        </div>
      </div>

      {/* Form */}
      <form id="academic-profile-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6 p-5">
          {/* Section: Personal Info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("academicProfile.sectionPersonal")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel htmlFor="academicTitle">{t("academicProfile.academicTitle")}</FieldLabel>
                <Input id="academicTitle" placeholder="GS., PGS., TS., ThS." {...register("academicTitle")} />
              </div>
              <div>
                <FieldLabel htmlFor="scientificRank">{t("academicProfile.scientificRank")}</FieldLabel>
                <Input id="scientificRank" placeholder="Giảng viên chính..." {...register("scientificRank")} />
              </div>
              <div>
                <FieldLabel htmlFor="degreeLevel">{t("academicProfile.degreeLevel")}</FieldLabel>
                <Controller
                  control={control}
                  name="degreeLevel"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="degreeLevel">
                        <SelectValue placeholder={t("academicProfile.selectDegree")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bachelor">{t("academicProfile.bachelor")}</SelectItem>
                        <SelectItem value="Master">{t("academicProfile.master")}</SelectItem>
                        <SelectItem value="PhD">{t("academicProfile.phd")}</SelectItem>
                        <SelectItem value="Professor">{t("academicProfile.professor")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <FieldLabel htmlFor="gender">{t("academicProfile.gender")}</FieldLabel>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder={t("academicProfile.selectGender")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t("academicProfile.male")}</SelectItem>
                        <SelectItem value="Female">{t("academicProfile.female")}</SelectItem>
                        <SelectItem value="Other">{t("academicProfile.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <FieldLabel htmlFor="dateOfBirth">{t("academicProfile.dateOfBirth")}</FieldLabel>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </div>
              <div>
                <FieldLabel htmlFor="nationality">{t("academicProfile.nationality")}</FieldLabel>
                <Input id="nationality" {...register("nationality")} />
              </div>
              <div>
                <FieldLabel htmlFor="hometown">{t("academicProfile.hometown")}</FieldLabel>
                <Input id="hometown" {...register("hometown")} />
              </div>
              <div>
                <FieldLabel htmlFor="specialization">{t("academicProfile.specialization")}</FieldLabel>
                <Input id="specialization" {...register("specialization")} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section: Institution */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("academicProfile.sectionInstitution")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="institution">{t("academicProfile.institution")}</FieldLabel>
                <Input id="institution" {...register("institution")} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="institutionAddress">{t("academicProfile.institutionAddress")}</FieldLabel>
                <Input id="institutionAddress" {...register("institutionAddress")} />
              </div>
              <div>
                <FieldLabel htmlFor="gsPgsYear">{t("academicProfile.gsPgsYear")}</FieldLabel>
                <Input
                  id="gsPgsYear"
                  type="number"
                  placeholder="2020"
                  {...register("gsPgsYear", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
                />
              </div>
              <div>
                <FieldLabel htmlFor="gsPgsInstitution">{t("academicProfile.gsPgsInstitution")}</FieldLabel>
                <Input id="gsPgsInstitution" {...register("gsPgsInstitution")} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="specializationAreas">{t("academicProfile.specializationAreas")}</FieldLabel>
                <Textarea
                  id="specializationAreas"
                  rows={3}
                  placeholder="AI, Machine Learning, Data Science..."
                  {...register("specializationAreas")}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section: Publication Counts */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("academicProfile.sectionPublications")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Controller
                control={control}
                name="isiScopusCount"
                render={({ field }) => (
                  <CounterField
                    id="isiScopusCount"
                    label={t("academicProfile.isiScopusCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="intlJournalCount"
                render={({ field }) => (
                  <CounterField
                    id="intlJournalCount"
                    label={t("academicProfile.intlJournalCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="domesticJournalCount"
                render={({ field }) => (
                  <CounterField
                    id="domesticJournalCount"
                    label={t("academicProfile.domesticJournalCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="intlConferenceCount"
                render={({ field }) => (
                  <CounterField
                    id="intlConferenceCount"
                    label={t("academicProfile.intlConferenceCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="domesticConferenceCount"
                render={({ field }) => (
                  <CounterField
                    id="domesticConferenceCount"
                    label={t("academicProfile.domesticConferenceCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="patentsCount"
                render={({ field }) => (
                  <CounterField
                    id="patentsCount"
                    label={t("academicProfile.patentsCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="phdSupervisedCount"
                render={({ field }) => (
                  <CounterField
                    id="phdSupervisedCount"
                    label={t("academicProfile.phdSupervisedCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="masterSupervisedCount"
                render={({ field }) => (
                  <CounterField
                    id="masterSupervisedCount"
                    label={t("academicProfile.masterSupervisedCount")}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border p-5">
          <Button type="submit" form="academic-profile-form" disabled={mutation.isPending}>
            <Save className="size-4" />
            {mutation.isPending ? t("common.saving") : t("academicProfile.saveBtn")}
          </Button>
        </div>
      </form>
    </div>
  );
}

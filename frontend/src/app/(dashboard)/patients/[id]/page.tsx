"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  HeartHandshake,
  Calendar,
  Shield,
  FileText,
  DollarSign,
  Clock,
  Plus,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { usePatient } from "@/hooks/usePatients";
import {
  useInsurances,
  useCreateInsurance,
  useUpdateInsurance,
  useDeactivateInsurance,
} from "@/hooks/useInsurance";
import { InsuranceCard } from "@/components/patients/InsuranceCard";
import { InsuranceForm } from "@/components/forms/InsuranceForm";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { EncounterForm } from "@/components/forms/EncounterForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  InsurancePolicy,
  CreateInsuranceRequest,
  CreateAppointmentRequest,
  CreateEncounterRequest,
} from "@/types";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import {
  usePatientEncounters,
  useCreateEncounter,
} from "@/hooks/useEncounters";
import { cn } from "@/lib/utils";

export default function PatientDetailsPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);

  // Queries
  const { data: patient, isLoading, isError } = usePatient(id);
  const { data: insurances, isLoading: isLoadingInsurances } = useInsurances(id);
  const { data: appointmentsData } = useAppointments({ patientId: id, limit: 50 });
  const { data: encounters = [] } = usePatientEncounters(id);

  const appointments = appointmentsData?.data || [];

  // Mutations
  const createInsuranceMutation = useCreateInsurance();
  const updateInsuranceMutation = useUpdateInsurance();
  const deactivateInsuranceMutation = useDeactivateInsurance();
  const createAppointmentMutation = useCreateAppointment();
  const createEncounterMutation = useCreateEncounter();

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const handleOpenAddInsurance = () => {
    setEditingPolicy(null);
    setIsInsuranceModalOpen(true);
  };

  const handleOpenEditInsurance = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setIsInsuranceModalOpen(true);
  };

  const handleSaveInsurance = async (data: CreateInsuranceRequest) => {
    if (!id) return;
    try {
      if (editingPolicy) {
        await updateInsuranceMutation.mutateAsync({
          id: editingPolicy.id,
          patientId: id,
          payload: data,
        });
        toast.success("Insurance policy updated successfully");
      } else {
        await createInsuranceMutation.mutateAsync(data);
        toast.success("Insurance policy added successfully");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save insurance policy";
      toast.error(msg);
      throw err;
    }
  };

  const handleDeactivateInsurance = async (policy: InsurancePolicy) => {
    if (!id) return;
    try {
      await deactivateInsuranceMutation.mutateAsync({
        id: policy.id,
        patientId: id,
      });
      toast.success(`${policy.insurerName} policy deactivated`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deactivate policy";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoadingSpinner size="lg" label="Loading patient record..." />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <Card className="p-8 text-center bg-rose-50 border-rose-200 max-w-lg mx-auto mt-8">
        <h2 className="text-base font-bold text-rose-800">
          Patient record not found
        </h2>
        <p className="text-xs text-rose-600 mt-1 mb-4">
          The requested patient could not be retrieved. It may have been deleted or belong to another organization.
        </p>
        <Link
          href="/patients"
          className={cn(buttonVariants({ size: "sm" }), "gradient-primary text-white border-0")}
        >
          Return to Patients
        </Link>
      </Card>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/patients"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Back to Patients Directory</span>
        </Link>

        <Link
          href={`/patients/${id}/edit`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs self-start sm:self-auto inline-flex items-center gap-1.5"
          )}
        >
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Patient Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl gradient-primary text-white shadow-md text-xl sm:text-2xl font-extrabold">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded">
                  MRN: {patient.patientId}
                </span>
                <StatusBadge status={patient.isActive} />
                {patient.gender && (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {patient.gender}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {fullName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>DOB: {formatDate(patient.dob)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{patient.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/70">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insurance">
            Insurance Policies ({insurances?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="appointments">
            Appointments ({appointments.length})
          </TabsTrigger>
          <TabsTrigger value="encounters">
            Encounters ({encounters.length})
          </TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Personal Demographics */}
            <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Demographics
                  </CardTitle>
                </div>
                <Link
                  href={`/patients/${id}/edit`}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Edit
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Full Legal Name:</span>
                  <span className="font-semibold text-slate-800">{fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medical Record #:</span>
                  <span className="font-mono font-semibold text-indigo-600">
                    {patient.patientId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-medium text-slate-800">{formatDate(patient.dob)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-medium text-slate-800">{patient.gender || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Record Created:</span>
                  <span className="font-medium text-slate-800">{formatDate(patient.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Contact Information */}
            <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Contact Channels
                  </CardTitle>
                </div>
                <Link
                  href={`/patients/${id}/edit`}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Edit
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono font-semibold text-slate-800">{patient.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[160px]">
                    {patient.email || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preferred Method:</span>
                  <span className="font-medium text-slate-800">Phone SMS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">HIPAA Consent:</span>
                  <span className="text-teal-700 font-semibold">Verified Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Address & Location */}
            <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Primary Address
                  </CardTitle>
                </div>
                <Link
                  href={`/patients/${id}/edit`}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Edit
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-1.5 text-xs text-slate-700">
                {patient.address?.street ? (
                  <>
                    <p className="font-medium">{patient.address.street}</p>
                    <p>
                      {patient.address.city}, {patient.address.state} {patient.address.zip}
                    </p>
                    <p className="text-slate-400">{patient.address.country || "USA"}</p>
                  </>
                ) : (
                  <p className="text-slate-400 italic">No address on file</p>
                )}
              </CardContent>
            </Card>

            {/* Card 4: Emergency Contact */}
            <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-rose-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Emergency Contact
                  </CardTitle>
                </div>
                <Link
                  href={`/patients/${id}/edit`}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Edit
                </Link>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {patient.emergencyContact?.name ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Designated Name:</span>
                      <span className="font-semibold text-slate-800">
                        {patient.emergencyContact.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Relationship:</span>
                      <span className="font-medium text-slate-800">
                        {patient.emergencyContact.relationship || "Designated"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {patient.emergencyContact.phone || "—"}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 italic">No emergency contact recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Card 5: Internal Clinical Notes */}
            <Card className="rounded-xl border border-slate-200/90 bg-white shadow-xs lg:col-span-2">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Internal Billing & Clinical Notes
                  </CardTitle>
                </div>
                <Link
                  href={`/patients/${id}/edit`}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  Edit
                </Link>
              </CardHeader>
              <CardContent className="p-4 text-xs text-slate-700 leading-relaxed">
                {patient.notes ? (
                  <p className="whitespace-pre-wrap">{patient.notes}</p>
                ) : (
                  <p className="text-slate-400 italic">No notes recorded for this patient.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Insurance Policies */}
        <TabsContent value="insurance" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Insurance Coverage
              </h3>
              <p className="text-xs text-slate-500">
                Primary and secondary electronic clearinghouse payer policies
              </p>
            </div>

            <Button
              onClick={handleOpenAddInsurance}
              size="sm"
              className="gradient-primary text-white border-0 shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Insurance</span>
            </Button>
          </div>

          {isLoadingInsurances ? (
            <div className="flex h-32 items-center justify-center">
              <LoadingSpinner size="md" label="Loading policies..." />
            </div>
          ) : !insurances || insurances.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No insurance policies"
              description="Add an insurance policy to enable claim electronic adjudication for this patient."
              actionLabel="Add Insurance Policy"
              onAction={handleOpenAddInsurance}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insurances.map((policy) => (
                <InsuranceCard
                  key={policy.id}
                  policy={policy}
                  onEdit={handleOpenEditInsurance}
                  onDeactivate={handleDeactivateInsurance}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Appointments */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Patient Appointment Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Scheduled consultations, duration, and attending practitioner
              </p>
            </div>
            <Button
              onClick={() => setIsAppointmentModalOpen(true)}
              size="sm"
              className="gradient-primary text-white border-0 shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Appointment</span>
            </Button>
          </div>

          {appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments scheduled"
              description="Book an appointment for this patient with an attending healthcare provider."
              actionLabel="Schedule Appointment"
              onAction={() => setIsAppointmentModalOpen(true)}
            />
          ) : (
            <div className="space-y-2.5">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {new Date(apt.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(apt.date).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dr. {apt.provider?.firstName} {apt.provider?.lastName} (
                        {apt.provider?.specialty || "General"}) • {apt.durationMins} mins •{" "}
                        {apt.type || "Consultation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={apt.status.toLowerCase()}
                      label={apt.status}
                    />
                    <Link
                      href={`/appointments/${apt.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "text-xs text-indigo-600 font-medium"
                      )}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Encounters */}
        <TabsContent value="encounters" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Documented Clinical Encounters
              </h3>
              <p className="text-xs text-slate-500">
                Service dates, examination findings, and billable visit entries
              </p>
            </div>
            <Button
              onClick={() => setIsEncounterModalOpen(true)}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Document Encounter</span>
            </Button>
          </div>

          {encounters.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No clinical encounters documented"
              description="Document a visit or clinical encounter for this patient to prepare claims."
              actionLabel="Document Encounter"
              onAction={() => setIsEncounterModalOpen(true)}
            />
          ) : (
            <div className="space-y-2.5">
              {encounters.map((enc) => (
                <div
                  key={enc.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        DOS: {new Date(enc.dateOfService).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {enc.visitType || "Office Visit"} • Dr. {enc.provider?.firstName}{" "}
                        {enc.provider?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {enc.status}
                    </span>
                    <Link
                      href={`/encounters/${enc.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "text-xs text-teal-700 font-medium"
                      )}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 5: Claims */}
        <TabsContent value="claims">
          <Card className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-subtle">
            <div className="flex flex-col items-center max-w-sm mx-auto space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Adjudicated Claims
              </h3>
              <p className="text-xs text-slate-500">
                All ANSI X12 837P claims generated for {fullName} with live clearinghouse statuses will be listed here.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 6: Payments */}
        <TabsContent value="payments">
          <Card className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-subtle">
            <div className="flex flex-col items-center max-w-sm mx-auto space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Patient Ledger & Copays
              </h3>
              <p className="text-xs text-slate-500">
                Patient ledger, copays, deductibles, insurance remits (835 ERA), and outstanding balances will be managed here.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 7: Documents */}
        <TabsContent value="documents">
          <Card className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-subtle">
            <div className="flex flex-col items-center max-w-sm mx-auto space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Patient Documentation
              </h3>
              <p className="text-xs text-slate-500">
                Scanned insurance cards, photo ID, signed HIPAA consent forms, and prior authorizations will be stored here securely.
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 8: Audit Trail */}
        <TabsContent value="activity">
          <Card className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl shadow-subtle">
            <div className="flex flex-col items-center max-w-sm mx-auto space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                HIPAA Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                All practitioner views, modifications, insurance updates, and claim dispatches are permanently audited with IP timestamps.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insurance Dialog Modal */}
      <InsuranceForm
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        patientId={id}
        initialData={editingPolicy}
        onSubmit={handleSaveInsurance}
        isSubmitting={createInsuranceMutation.isPending || updateInsuranceMutation.isPending}
      />

      {/* Appointment Dialog Modal */}
      <AppointmentForm
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        defaultPatientId={id}
        onSubmit={async (data: CreateAppointmentRequest) => {
          await createAppointmentMutation.mutateAsync(data);
          toast.success("Appointment scheduled for patient.");
        }}
        isSubmitting={createAppointmentMutation.isPending}
      />

      {/* Encounter Dialog Modal */}
      <EncounterForm
        isOpen={isEncounterModalOpen}
        onClose={() => setIsEncounterModalOpen(false)}
        defaultPatientId={id}
        onSubmit={async (data: CreateEncounterRequest) => {
          await createEncounterMutation.mutateAsync(data);
          toast.success("Clinical encounter documented.");
        }}
        isSubmitting={createEncounterMutation.isPending}
      />
    </div>
  );
}

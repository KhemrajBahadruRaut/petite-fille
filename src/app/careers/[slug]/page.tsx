"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, DollarSign, Briefcase, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiUrl } from "../../../utils/api";
import { ApplicationModal } from "@/components/careers/careers";
import { hasAppliedForJob } from "@/utils/jobApplicationStorage";
import { formatJobPostingTime } from "@/utils/jobPostingTime";

interface JobListing {
  id: string;
  title: string;
  type: string;
  experience: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  postedDaysAgo: number;
  postedSecondsAgo: number;
  slug: string;
}

export default function JobSlugPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applyingJob, setApplyingJob] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJob = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setNotFound(false);

    try {
      const response = await fetch(apiUrl("jobs/get_jobs.php"), {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to fetch jobs");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response");

      const found = data.find(
        (j: Record<string, unknown>) =>
          (j.slug as string)?.toLowerCase() === slug.toLowerCase(),
      );

      if (!found) {
        setNotFound(true);
        return;
      }

      const requirements = (() => {
        const raw = found.requirements;
        if (Array.isArray(raw))
          return raw.map((i: unknown) => `${i ?? ""}`.trim()).filter(Boolean);
        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw || "[]");
            if (Array.isArray(parsed))
              return parsed
                .map((i: unknown) => `${i ?? ""}`.trim())
                .filter(Boolean);
          } catch {
            return raw
              .split(/\r\n|\r|\n/)
              .map((i: string) => i.trim())
              .filter(Boolean);
          }
        }
        return [];
      })();

      setJob({
        id: `${found.id ?? ""}`,
        title: (found.title || "").trim() || "Untitled Role",
        type: found.type || "Full-time",
        experience: (found.experience || "").trim() || "Not specified",
        salary: (found.salary || "").trim() || "Not specified",
        location: (found.location || "").trim() || "Not specified",
        description:
          (found.description || "").trim() || "Description not available.",
        requirements,
        postedDaysAgo: Number.isFinite(Number(found.postedDaysAgo))
          ? Math.max(0, Number(found.postedDaysAgo))
          : 0,
        postedSecondsAgo: Number.isFinite(Number(found.postedSecondsAgo))
          ? Math.max(0, Number(found.postedSecondsAgo))
          : Number.isFinite(Number(found.postedDaysAgo))
            ? Math.max(0, Number(found.postedDaysAgo)) * 24 * 60 * 60
            : 0,
        slug: found.slug || "",
      });
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    setHasApplied(job ? hasAppliedForJob(job.id) : false);
  }, [job]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#EEC27E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1
            className="text-3xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "fairplay" }}
          >
            Job Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            This job listing may have been removed or the link may be incorrect.
          </p>
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 rounded-lg bg-[#EEC27E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d9a960]"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Openings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "arial" }}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all openings
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ fontFamily: "fairplay" }}
          >
            {job.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-300"
          >
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#EEC27E]" />
              {job.type}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#EEC27E]" />
              {job.experience}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#EEC27E]" />
              {job.salary}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#EEC27E]" />
              {job.location}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <span className="text-xs text-gray-400">
              Posted {formatJobPostingTime(job.postedSecondsAgo, job.postedDaysAgo)}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2
                className="text-xl font-bold text-gray-900 mb-4"
                style={{ fontFamily: "fairplay" }}
              >
                About the Role
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </motion.section>

            {job.requirements.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h2
                  className="text-xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: "fairplay" }}
                >
                  Requirements
                </h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-[#EEC27E] shrink-0" />
                      <span className="text-gray-600 leading-relaxed">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}
          </div>

          {/* Sidebar - Apply CTA */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-8 bg-white border-2 border-[#EEC27E] rounded-xl p-6 text-center"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Interested?
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Apply now and join the Petite Fille family.
              </p>
              {hasApplied ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 px-6 py-3 text-sm font-semibold text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Application submitted
                </div>
              ) : (
                <button
                  onClick={() =>
                    setApplyingJob({ id: job.id, title: job.title })
                  }
                  className="w-full rounded-lg bg-[#EEC27E] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#d9a960] hover:shadow-lg"
                >
                  Apply Now
                </button>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">
                  Or email your resume to
                </p>
                <a
                  href="mailto:petitefillerosanna@gmail.com"
                  className="text-sm text-[#EEC27E] hover:underline"
                >
                  petitefillerosanna@gmail.com
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {applyingJob && (
          <ApplicationModal
            job={applyingJob}
            onClose={() => setApplyingJob(null)}
            onSubmitted={() => setHasApplied(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

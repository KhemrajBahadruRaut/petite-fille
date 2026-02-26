"use client";
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Coffee, Heart, Gift } from 'lucide-react';
import CareersCarousal from './CareersCarousel';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/utils/api';

// Types (unchanged)
interface JobListing {
    id: string;
    title: string;
    department: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    experience: string;
    salary: string;
    location: string;
    postedDaysAgo: number;
    description: string;
    requirements: string[];
}

interface WhyWorkWithUsItem {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

// Sample data (unchanged)
const WHY_WORK_WITH_US: WhyWorkWithUsItem[] = [
    {
        id: '1',
        icon: Gift,
        title: 'Great Benefits',
        description: 'Lorem ipsum dolor sit it amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Idunt ut you labore et dolore magna aliqua.'
    },
    {
        id: '2',
        icon: Heart,
        title: 'Work-Life Balance',
        description: 'Lorem ipsum dolor sit it amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
        id: '3',
        icon: Coffee,
        title: 'Amazing Culture',
        description: 'Lorem ipsum dolor sit it amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Idunt ut you labore et dolore magna aliqua.'
    }
];

interface JobsApiRecord {
    id?: string | number;
    title?: string;
    type?: string;
    experience?: string;
    salary?: string;
    location?: string;
    description?: string;
    requirements?: string[] | string;
    postedDaysAgo?: number;
}

const DEFAULT_DEPARTMENT = 'Open Department';

const normalizeRequirements = (requirements: JobsApiRecord['requirements']): string[] => {
    if (Array.isArray(requirements)) {
        return requirements.map((item) => `${item ?? ''}`.trim()).filter(Boolean);
    }

    if (typeof requirements === 'string') {
        try {
            const parsed = JSON.parse(requirements || '[]');
            if (Array.isArray(parsed)) {
                return parsed.map((item) => `${item ?? ''}`.trim()).filter(Boolean);
            }
        } catch {
            return requirements
                .split(/\r\n|\r|\n/)
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }

    return [];
};

const normalizeJobType = (type: string | undefined): JobListing['type'] => {
    if (type === 'Part-time' || type === 'Contract') {
        return type;
    }
    return 'Full-time';
};

const normalizeJob = (job: JobsApiRecord): JobListing => ({
    // Backend stores no explicit department yet, so keep a stable label for current UI.
    id: `${job.id ?? ''}`,
    title: (job.title || '').trim() || 'Untitled Role',
    department: DEFAULT_DEPARTMENT,
    type: normalizeJobType(job.type),
    experience: (job.experience || '').trim() || 'Experience not specified',
    salary: (job.salary || '').trim() || 'Salary not specified',
    location: (job.location || '').trim() || 'Location not specified',
    postedDaysAgo: Number.isFinite(Number(job.postedDaysAgo))
        ? Math.max(0, Number(job.postedDaysAgo))
        : 0,
    description: (job.description || '').trim() || 'Description not available.',
    requirements: normalizeRequirements(job.requirements)
});

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};

// Optimized components with animations
const WhyWorkCard = React.memo(({ item, index }: { item: WhyWorkWithUsItem, index: number }) => {
    const IconComponent = item.icon;

    return (
        <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            variants={fadeInUp}
            className="border-2 border-[#EEC27E] p-6 sm:p-8 bg-white hover:shadow-lg transition-shadow duration-300 group"
        >
            <div className="text-center">
                <div className="mb-4 flex justify-center">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <IconComponent className="w-12 h-12 sm:w-16 sm:h-16 text-[#EEC27E]" />
                    </motion.div>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {item.description}
                </p>
            </div>
        </motion.div>
    );
});

WhyWorkCard.displayName = 'WhyWorkCard';

const JobListItem = React.memo(({
    job,
    isSelected,
    onClick
}: {
    job: JobListing;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`p-4 sm:p-6 border-b border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${isSelected ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : ''
            }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        aria-label={`View details for ${job.title} position`}
    >
        <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{job.title}</h3>
            <span className="text-[#EEC27E] text-xs sm:text-sm font-medium">
                {job.postedDaysAgo}d ago
            </span>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-3">{job.type}</p>

        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#EEC27E] rounded-full"></span>
                {job.experience}
            </span>
            <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#EEC27E] rounded-full"></span>
                {job.salary}
            </span>
        </div>

        <div className="mt-3 flex justify-end">
            <motion.div 
                className="w-8 h-8 bg-[#EEC27E] rounded-full flex items-center justify-center hover:bg-[#EEC27E] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </motion.div>
        </div>
    </motion.div>
));

JobListItem.displayName = 'JobListItem';

const JobDetails = React.memo(({ job }: { job: JobListing }) => (
    <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={scaleIn}
        transition={{ duration: 0.3 }}
        className="bg-yellow-50 border-2 border-[#EEC27E] p-6 sm:p-8"
    >
        <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {job.title} of {job.department}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                {job.description}
            </p>

            <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                    <span className="w-2 h-2 bg-[#EEC27E] rounded-full"></span>
                    <span>{job.experience}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                    <span className="w-2 h-2 bg-[#EEC27E] rounded-full"></span>
                    <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
                    <span className="w-2 h-2 bg-[#EEC27E] rounded-full"></span>
                    <span>{job.location}</span>
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
            <div className="space-y-3">
                {job.requirements.map((requirement, index) => (
                    <motion.p 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-gray-600 text-sm sm:text-base leading-relaxed"
                    >
                        {requirement}
                    </motion.p>
                ))}
            </div>
        </div>
    </motion.div>
));

JobDetails.displayName = 'JobDetails';

export default function CareersPage() {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);
    const [jobsError, setJobsError] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        setIsLoadingJobs(true);
        setJobsError(null);

        try {
            const response = await fetch(apiUrl('jobs/get_jobs.php'), { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid jobs response');
            }

            const normalizedJobs = data
                .map((item: JobsApiRecord) => normalizeJob(item))
                .filter((item: JobListing) => item.id !== '');

            setJobs(normalizedJobs);
        } catch {
            setJobs([]);
            setJobsError('Unable to load jobs right now. Please try again later.');
        } finally {
            setIsLoadingJobs(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Memoized selected job to prevent unnecessary re-renders
    const selectedJob = useMemo(() =>
        jobs.find(job => job.id === selectedJobId),
        [jobs, selectedJobId]
    );

    useEffect(() => {
        if (!selectedJobId) {
            return;
        }

        const exists = jobs.some((job) => job.id === selectedJobId);
        if (!exists) {
            setSelectedJobId(null);
        }
    }, [jobs, selectedJobId]);

    // Optimized job selection handler
    const handleJobSelect = useCallback((jobId: string) => {
        setSelectedJobId(current => current === jobId ? null : jobId);
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 "
        >
            <div>
                <CareersCarousal />
            </div>
            
            {/* Hero Section */}
            <section className="bg-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6"
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                        ex ea commodo.
                    </motion.p>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-600 text-sm sm:text-base leading-relaxed mb-12"
                    >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                    </motion.p>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl sm:text-4xl lg:text-5xl text-gray-900" 
                        style={{fontFamily: 'fairplay'}}
                    >
                        Why work with us?
                    </motion.h1>
                </div>
            </section>

            {/* Why Work With Us Section */}
            <section className="py-8 sm:py-10 bg-white" aria-labelledby="why-work-heading">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {/* Left column - single card */}
                        <div className="md:col-span-1">
                            <WhyWorkCard item={WHY_WORK_WITH_US[0]} index={0} />
                        </div>

                        {/* Right column - stacked cards */}
                        <div className="sm:pt-20">
                            <WhyWorkCard item={WHY_WORK_WITH_US[1]} index={1} />
                        </div>
                        <div className="md:col-span-1">
                            <WhyWorkCard item={WHY_WORK_WITH_US[2]} index={2} />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Current Openings Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-50" aria-labelledby="openings-heading">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        id="openings-heading" 
                        className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 text-center mb-12 sm:mb-16" 
                        style={{fontFamily: 'fairplay'}}
                    >
                        Current Openings
                    </motion.h2>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8" style={{fontFamily: 'arial'}}>
                        {/* Job Listings */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {isLoadingJobs ? (
                                    <div className="p-6 text-center text-gray-500 text-sm sm:text-base">
                                        Loading openings...
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-sm sm:text-base">
                                        There are no listings for now.
                                    </div>
                                ) : (
                                    jobs.map((job) => (
                                        <JobListItem
                                            key={job.id}
                                            job={job}
                                            isSelected={selectedJobId === job.id}
                                            onClick={() => handleJobSelect(job.id)}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Job Details */}
                        <div className="lg:col-span-3">
                            <AnimatePresence mode="wait">
                                {selectedJob ? (
                                    <JobDetails key={selectedJob.id} job={selectedJob} />
                                ) : (
                                    <motion.div 
                                        key="placeholder"
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        variants={fadeInUp}
                                        className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center"
                                    >
                                        <div className="max-w-sm mx-auto">
                                            <motion.svg 
                                                initial={{ rotate: 0 }}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </motion.svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {jobs.length === 0 ? 'There are no listings for now.' : 'Select a job to view details'}
                                            </h3>
                                            <p className="text-gray-500 text-sm">
                                                {jobs.length === 0
                                                    ? 'Please check back later for new openings.'
                                                    : 'Click on any job listing to see the full description and requirements.'}
                                            </p>
                                            {jobsError && (
                                                <p className="text-red-500 text-xs mt-3">{jobsError}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-white py-8 sm:py-12" aria-labelledby="contact-heading">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <p className="text-gray-600 text-sm sm:text-base"
                        style={{fontFamily: 'arial'}}
                     >
                        <span className="text-[#EEC27E] font-medium">Don`&apos;`t see any post for you?</span>{' '}
                        Email your resume to{' '}
                        <a
                            href="mailto:abc@example.com"
                            className="text-[#EEC27E] hover:text-[#EEC27E] transition-colors underline"
                        >
                            abc@example.com
                        </a>
                    </p>
                </motion.div>
            </section>
        </motion.div>
    );
}

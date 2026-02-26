import { Briefcase, Scale, Dumbbell, GraduationCap } from 'lucide-react';

export const STATUS_COLORS: Record<string, string> = {
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  active_awaiting_pop: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export const PLAN_LABELS: Record<string, string> = {
  free_trial: 'Free Trial',
  basic: 'Basic',
  standard: 'Standard',
  pro: 'Pro',
  custom: 'Custom',
};

export const SYSTEM_ICONS: Record<string, typeof Briefcase> = {
  business: Briefcase,
  legal: Scale,
  gym: Dumbbell,
  school: GraduationCap,
};

export const SYSTEM_LABELS: Record<string, string> = {
  business: 'BizPro',
  legal: 'LawPro',
  gym: 'GymPro',
  school: 'EduPro',
};

export const SYSTEM_COLORS: Record<string, string> = {
  business: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
  legal: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white',
  gym: 'bg-lime-600 text-white dark:bg-lime-500 dark:text-white',
  school: 'bg-teal-600 text-white dark:bg-teal-500 dark:text-white',
};

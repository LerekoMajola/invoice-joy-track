import { Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Car, Dumbbell } from 'lucide-react';

export const STATUS_COLORS: Record<string, string> = {
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
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
  workshop: Wrench,
  school: GraduationCap,
  legal: Scale,
  hire: Hammer,
  guesthouse: Hotel,
  fleet: Car,
  gym: Dumbbell,
};

export const SYSTEM_LABELS: Record<string, string> = {
  business: 'Business',
  workshop: 'Workshop',
  school: 'School',
  legal: 'Legal',
  hire: 'HirePro',
  guesthouse: 'StayPro',
  fleet: 'FleetPro',
  gym: 'GymPro',
};

export const SYSTEM_COLORS: Record<string, string> = {
  business: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
  workshop: 'bg-orange-600 text-white dark:bg-orange-500 dark:text-white',
  school: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
  legal: 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white',
  hire: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-white',
  guesthouse: 'bg-rose-600 text-white dark:bg-rose-500 dark:text-white',
  fleet: 'bg-slate-600 text-white dark:bg-slate-500 dark:text-white',
  gym: 'bg-lime-600 text-white dark:bg-lime-500 dark:text-white',
};

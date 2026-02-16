export interface Testimonial {
  quote: string;
  initials: string;
  name: string;
  role: string;
  product: string;
  accentColor: string;
  cardBg: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "This platform completely transformed how we handle quotes and invoices. We saved hours every week and our clients love the professional documents.",
    initials: "TM",
    name: "Tšepo Mohale",
    role: "Operations Manager",
    product: "BizPro",
    accentColor: "bg-indigo-500/30",
    cardBg: "from-indigo-500/10 to-indigo-600/5",
  },
  {
    quote: "ShopPro made our workshop run like clockwork. Job cards, parts tracking, and invoicing — all in one place. Our turnaround time dropped by 40%.",
    initials: "LK",
    name: "Lebohang Khesa",
    role: "Workshop Owner",
    product: "ShopPro",
    accentColor: "bg-orange-500/30",
    cardBg: "from-orange-500/10 to-orange-600/5",
  },
  {
    quote: "Fee collection used to be a nightmare. EduPro gives us full visibility on who's paid, who owes, and automates reminders. Parents love it too.",
    initials: "MN",
    name: "Mapalesa Ntsane",
    role: "School Administrator",
    product: "EduPro",
    accentColor: "bg-cyan-500/30",
    cardBg: "from-cyan-500/10 to-cyan-600/5",
  },
  {
    quote: "Court dates, billable hours, case files — LawPro keeps everything organised. I can't imagine going back to spreadsheets.",
    initials: "DP",
    name: "'Mathato Pheko",
    role: "Legal Practitioner",
    product: "LawPro",
    accentColor: "bg-emerald-500/30",
    cardBg: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    quote: "We rent out 200+ items and HirePro tracks every single one. Returns, deposits, availability — it's all seamless now.",
    initials: "TR",
    name: "Thabo Ramoeletsi",
    role: "Rental Business Owner",
    product: "HirePro",
    accentColor: "bg-amber-500/30",
    cardBg: "from-amber-500/10 to-amber-600/5",
  },
  {
    quote: "StayPro helped us go from pen-and-paper bookings to a fully digital guesthouse. Occupancy is up 25% since we started.",
    initials: "KS",
    name: "Keketso Sello",
    role: "Guesthouse Manager",
    product: "StayPro",
    accentColor: "bg-rose-500/30",
    cardBg: "from-rose-500/10 to-rose-600/5",
  },
  {
    quote: "Managing 30 vehicles was chaos before FleetPro. Now we track fuel, maintenance, and costs per vehicle effortlessly.",
    initials: "BT",
    name: "Bokang Thamae",
    role: "Fleet Supervisor",
    product: "FleetPro",
    accentColor: "bg-slate-500/30",
    cardBg: "from-slate-500/10 to-slate-600/5",
  },
  {
    quote: "GymPro simplified our member management completely. Class schedules, attendance, and billing all in one dashboard. Members love the experience.",
    initials: "NM",
    name: "Nthabiseng Molapo",
    role: "Gym Owner",
    product: "GymPro",
    accentColor: "bg-lime-500/30",
    cardBg: "from-lime-500/10 to-lime-600/5",
  },
];

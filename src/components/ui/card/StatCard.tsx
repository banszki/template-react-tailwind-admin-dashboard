import Card from "./Card";

interface StatCardProps {
  label: string; // small caption under the value, e.g. "Needing attention"
  value: string; // the headline figure, e.g. "3" or "74%" — pre-formatted by the caller
  accent?: string; // extra text-color classes for the value (e.g. "text-rose-600 dark:text-rose-400")
}

// A compact metric tile — "10 Plants", "3 Needing attention", etc. Pairs with itself in a
// `grid-cols-2 sm:grid-cols-4` row for an at-a-glance stats strip at the top of a dashboard.
// Extracted from app-evergreen-ai's Dashboard page.
const StatCard: React.FC<StatCardProps> = ({ label, value, accent = "" }) => (
  <Card className="px-4 py-3">
    <div className={`text-2xl font-semibold ${accent || "text-gray-800 dark:text-white/90"}`}>{value}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
  </Card>
);

export default StatCard;

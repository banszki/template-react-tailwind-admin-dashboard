// Optional sidebar footer slot. Neutralised from the upstream "buy PRO" promo — products can
// drop in a build/version stamp, environment badge, or remove the <SidebarWidget /> render.
export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]">
      <p className="text-gray-500 text-theme-sm dark:text-gray-400">
        Web Basis · shared UI foundation
      </p>
    </div>
  );
}

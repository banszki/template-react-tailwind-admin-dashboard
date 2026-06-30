import PageMeta from "../../components/common/PageMeta";

// Neutral starter home. Replace with the product's real dashboard; the shared chrome
// (sidebar, header, dark-mode theme) is provided by AppLayout and needs no changes.
export default function Home() {
  return (
    <>
      <PageMeta
        title="Web Basis — Starter Dashboard"
        description="Shared React + Tailwind admin basis for the estate's product UIs."
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Web Basis — starter shell
        </h1>
        <p className="mt-2 max-w-2xl text-gray-500 dark:text-gray-400">
          This is the shared admin foundation (layout · theme · component kit) for the estate's
          product UIs. Swap this page for your dashboard, add routes in <code>App.tsx</code>, and
          extend the sidebar in <code>AppSidebar.tsx</code>. The chrome, dark mode, and the
          component kit come for free.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        {[
          { k: "Layout shell", v: "sidebar · header · responsive" },
          { k: "Theme", v: "light / dark, built in" },
          { k: "Component kit", v: "forms · tables · charts" },
        ].map((c) => (
          <div
            key={c.k}
            className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:col-span-4"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">{c.k}</span>
            <h3 className="mt-1 font-medium text-gray-800 dark:text-white/90">{c.v}</h3>
          </div>
        ))}
      </div>
    </>
  );
}

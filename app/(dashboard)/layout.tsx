import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getCurrentUser } from "@/lib/dal";
import { MobileNavProvider } from "@/components/MobileNavProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <MobileNavProvider>
      {/*
        Shell: full-viewport flex row.
        Sidebar is fixed-width; right side is a flex column (topbar + scrollable main).
        min-w-0 on the right column prevents flex children from overflowing their container.
      */}
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        <Sidebar user={user} />

        {/* Right column — topbar + content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar user={user} />

          {/*
            <main> scrolls independently.
            padding: responsive via --page-pad token.
            max-w keeps content from stretching too wide on ultrawide screens.
          */}
          <main
            className="flex-1 overflow-y-auto"
            style={{
              padding: "var(--page-pad)",
              paddingTop: "calc(var(--page-pad) * 0.75)",
            }}
          >
            <div className="max-w-screen-xl mx-auto w-full h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}

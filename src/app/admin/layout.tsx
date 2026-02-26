"use client";

import { useState, useEffect, ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession, isAdminAuthenticated } from "@/utils/adminAuth";

interface MenuItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: ReactNode;
}

interface MenuSection {
  type?: "section";
  id: string;
  label: string;
  shortLabel: string;
  icon: ReactNode;
  children: MenuItem[];
}

type MenuItemType = MenuItem | MenuSection;

interface AdminLayoutProps {
  children: ReactNode;
}

function CurrentDateTime() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-right hidden sm:block">
      <p className="text-sm font-semibold text-slate-800">
        {now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </p>
      <p className="text-xs text-slate-500">
        {now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [animatingItems, setAnimatingItems] = useState<Record<string, boolean>>(
    {},
  );
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  const menuItems = useMemo<MenuItemType[]>(
    () => [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        shortLabel: "Dash",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
            />
          </svg>
        ),
      },
      {
        type: "section",
        id: "cms",
        label: "Content Management",
        shortLabel: "CMS",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
        children: [
          {
            href: "/admin/menu-admin",
            label: "Menu",
            shortLabel: "Menu",
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            ),
          },
          {
            href: "/admin/gallery",
            label: "Gallery",
            shortLabel: "Gallery",
            icon: (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            href: "/admin/adminAbout",
            label: "About",
            shortLabel: "About",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A8 8 0 0112 15a8 8 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
          },
          {
            href: "/admin/merchendise",
            label: "Merchendise",
            shortLabel: "Merch",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 8h14l1 12H4L5 8z"
                />
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 8a3 3 0 016 0"
                />
              </svg>
            ),
          },
          {
            href: "/admin/jobs",
            label: "Jobs",
            shortLabel: "Jobs",
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z"
                />
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 7V5a3 3 0 013-3h0a3 3 0 013 3v2M9 12h6"
                />
              </svg>
            ),
          },
        ],
      },
      {
        href: "/admin/orders",
        label: "Orders",
        shortLabel: "Orders",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/contacts",
        label: "Contacts",
        shortLabel: "Contacts",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 4a2 2 0 00-2 2v12a2 2 0 002 2h14a1 1 0 001-1v-1h-3a2 2 0 01-2-2V8a2 2 0 012-2h3V5a1 1 0 00-1-1H5z"
            />
            <circle
              cx="12"
              cy="10"
              r="3"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 16a4 4 0 016 0"
            />
          </svg>
        ),
      },
      {
        href: "/admin/reservations",
        label: "Reservations",
        shortLabel: "Bookings",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        href: "/admin/settings",
        label: "Settings",
        shortLabel: "Settings",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
      },
    ],
    [],
  );

  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      setIsAuthenticated(false);
      return;
    }

    const authenticated = isAdminAuthenticated();
    setIsAuthenticated(authenticated);
    setAuthChecked(true);

    if (!authenticated) {
      router.replace("/admin");
    }
  }, [isLoginPage, pathname, router]);

  // Auto-expand CMS section if we're on a CMS page
  useEffect(() => {
    const cmsPages = [
      "/admin/menu-admin",
      "/admin/gallery",
      "/admin/adminAbout",
      "/admin/merchendise",
      "/admin/jobs",
    ];
    if (cmsPages.includes(pathname)) {
      setExpandedSections((prev) => ({ ...prev, cms: true }));
    }
  }, [pathname]);

  // Optimized resize handler with debounce
  useEffect(() => {
    const checkDevice = (): void => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkDevice();

    let timeoutId: NodeJS.Timeout;
    const handleResize = (): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSection = async (sectionId: string): Promise<void> => {
    setAnimatingItems((prev) => ({ ...prev, [sectionId]: true }));

    // Smooth animation delay
    await new Promise<void>((resolve) => setTimeout(resolve, 50));

    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));

    // Clean up animation state
    setTimeout(() => {
      setAnimatingItems((prev) => ({ ...prev, [sectionId]: false }));
    }, 300);
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = (): void => {
    clearAdminSession();
    router.push("/admin");
  };

  const getPageTitle = (): string => {
    // Check CMS section first
    const cmsSection = menuItems.find(
      (item): item is MenuSection =>
        "type" in item && item.type === "section" && item.id === "cms",
    );

    if (cmsSection?.children) {
      const cmsItem = cmsSection.children.find(
        (child) => pathname === child.href,
      );
      if (cmsItem) return cmsItem.label;
    }

    // Check regular menu items
    const item = menuItems.find(
      (item): item is MenuItem => "href" in item && item.href === pathname,
    );
    return item ? item.label : "Dashboard";
  };

  const isMenuItem = (item: MenuItemType): item is MenuItem => {
    return "href" in item;
  };

  const isMenuSection = (item: MenuItemType): item is MenuSection => {
    return "type" in item && item.type === "section";
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Checking admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-70 h-screen bg-white border-r border-slate-200 shadow-sm
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0 lg:w-20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">PF</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-lg">
                  Petite Fille
                </h1>
                <p className="text-sm text-slate-500">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">PF</span>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 group"
            aria-label="Toggle sidebar"
          >
            <svg
              className={`w-5 h-5 text-slate-600 transition-all duration-300 group-hover:text-slate-800 ${
                isSidebarOpen ? "" : "rotate-180"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              if (isMenuSection(item)) {
                const isExpanded = expandedSections[item.id] || false;
                const isAnimating = animatingItems[item.id] || false;
                const hasActiveChild =
                  item.children?.some((child) => pathname === child.href) ||
                  false;

                return (
                  <li key={item.id} className="space-y-1">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`
                        group w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden
                        ${
                          hasActiveChild || isExpanded
                            ? "bg-blue-50 text-blue-700 shadow-sm transform scale-[1.02]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm hover:scale-[1.01]"
                        }
                      `}
                    >
                      {/* Animated background effect */}
                      <div
                        className={`
                        absolute inset-0 bg-linear-to-r from-blue-500/5 to-blue-600/5 rounded-lg
                        transition-all duration-300 transform
                        ${hasActiveChild || isExpanded ? "scale-100 opacity-100" : "scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"}
                      `}
                      />

                      {/* Active indicator */}
                      <div
                        className={`
                        absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full
                        transition-all duration-300 transform
                        ${hasActiveChild || isExpanded ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
                      `}
                      />

                      <div className="relative z-10 flex items-center w-full">
                        {/* Icon */}
                        <div
                          className={`
                          shrink-0 transition-all duration-300
                          ${hasActiveChild || isExpanded ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
                          ${isSidebarOpen ? "mr-3" : "mx-auto"}
                        `}
                        >
                          {item.icon}
                        </div>

                        {/* Label */}
                        <span
                          className={`
                          font-medium transition-all duration-300 flex-1 text-left
                          ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 lg:hidden"}
                        `}
                        >
                          {item.label}
                        </span>

                        {/* Expand/Collapse Arrow */}
                        {isSidebarOpen && (
                          <div
                            className={`
                            transition-all duration-300 transform
                            ${isExpanded ? "rotate-180" : "rotate-0"}
                            ${isAnimating ? "scale-110" : "scale-100"}
                          `}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Collapsed state tooltip */}
                        {!isSidebarOpen && (
                          <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                            {item.label}
                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Collapsible Children */}
                    <div
                      className={`
                        overflow-hidden transition-all duration-300 ease-out
                        ${
                          isExpanded
                            ? "opacity-100 transform translate-y-0"
                            : "opacity-0 transform -translate-y-2"
                        }
                        ${!isSidebarOpen ? "lg:hidden" : ""}
                      `}
                      style={{
                        maxHeight: isExpanded
                          ? `${item.children.length * 60 + 16}px`
                          : "0px",
                      }}
                    >
                      <ul className="space-y-1 ml-4 mt-1">
                        {item.children?.map((child, index) => {
                          const isActive = pathname === child.href;
                          return (
                            <li
                              key={child.href}
                              className={`
                                transform transition-all duration-300
                                ${
                                  isExpanded
                                    ? "translate-x-0 opacity-100"
                                    : "-translate-x-4 opacity-0"
                                }
                              `}
                              style={{
                                transitionDelay: isExpanded
                                  ? `${index * 50}ms`
                                  : "0ms",
                              }}
                            >
                              <Link
                                href={child.href}
                                className={`
                                  group flex items-center px-3 py-2 rounded-lg transition-all duration-300 relative overflow-hidden
                                  ${
                                    isActive
                                      ? "bg-blue-100 text-blue-800 shadow-sm transform scale-[1.02] border-l-2 border-blue-500"
                                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:shadow-sm hover:scale-[1.01]"
                                  }
                                `}
                                onClick={() =>
                                  isMobile && setIsSidebarOpen(false)
                                }
                              >
                                {/* Animated background */}
                                <div
                                  className={`
                                  absolute inset-0 bg-linear-to-r from-blue-500/3 to-blue-600/3 rounded-lg
                                  transition-all duration-300 transform
                                  ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"}
                                `}
                                />

                                <div className="relative z-10 flex items-center w-full">
                                  {/* Child Icon */}
                                  <div
                                    className={`
                                    shrink-0 mr-3 transition-all duration-300
                                    ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
                                  `}
                                  >
                                    {child.icon}
                                  </div>

                                  {/* Child Label */}
                                  <span className="font-medium transition-all duration-300 flex-1">
                                    {child.label}
                                  </span>

                                  {/* Active indicator */}
                                  {isActive && (
                                    <div className="ml-auto flex items-center space-x-1">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </li>
                );
              }

              if (isMenuItem(item)) {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm transform scale-[1.02]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm hover:scale-[1.01]"
                        }
                      `}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      {/* Animated background effect */}
                      <div
                        className={`
                        absolute inset-0 bg-linear-to-r from-blue-500/5 to-blue-600/5 rounded-lg
                        transition-all duration-300 transform
                        ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100"}
                      `}
                      />

                      {/* Active indicator */}
                      <div
                        className={`
                        absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full
                        transition-all duration-300 transform
                        ${isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}
                      `}
                      />

                      <div className="relative z-10 flex items-center w-full">
                        {/* Icon */}
                        <div
                          className={`
                          shrink-0 transition-all duration-300
                          ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}
                          ${isSidebarOpen ? "mr-3" : "mx-auto"}
                        `}
                        >
                          {item.icon}
                        </div>

                        {/* Label */}
                        <span
                          className={`
                          font-medium transition-all duration-300 flex-1
                          ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 lg:hidden"}
                        `}
                        >
                          {item.label}
                        </span>

                        {/* Collapsed state tooltip */}
                        {!isSidebarOpen && (
                          <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                            {item.label}
                            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
                          </div>
                        )}

                        {/* Active pulse indicator */}
                        {isActive && isSidebarOpen && (
                          <div className="ml-auto flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div
            className={`
            transition-all duration-300 overflow-hidden
            ${isSidebarOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0 lg:max-h-20 lg:opacity-100"}
          `}
          >
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-300 cursor-pointer group">
              <div className="w-10 h-10 bg-linear-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  Administrator
                </p>
                <p className="text-xs text-slate-500 truncate">Online now</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
        flex-1 min-h-screen transition-all duration-300
        ${isSidebarOpen ? "lg:ml-0" : "lg:ml-0"}
      `}
      >
        {/* Top Bar */}
        <header className="border-b border-slate-200 sticky top-0 z-30 backdrop-blur-sm bg-white/95 shadow-sm">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 lg:hidden group"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-slate-600 group-hover:text-slate-800 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-800">
                  {getPageTitle()}
                </h1>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                <span className="text-sm text-slate-500 font-medium">
                  Management
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notification Bell */}
              {/* <button className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 group">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 54 34"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5-5V9a9 9 0 10-10 9v3h5zm5-5a1 1 0 100-2 1 1 0 000 2z"
                  />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button> */}

              <CurrentDateTime />

              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Logout
              </button>

              {/* Profile Avatar */}
              <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-110 group">
                <span className="text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-300">
                  A
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[calc(100vh-180px)] transition-all duration-300 hover:shadow-md">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 200px;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-bounce-gentle {
          animation: bounce 1s ease-in-out infinite;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for sidebar */
        aside nav::-webkit-scrollbar {
          width: 4px;
        }

        aside nav::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 2px;
        }

        aside nav::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
          transition: background-color 0.3s ease;
        }

        aside nav::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Performance optimizations */
        * {
          box-sizing: border-box;
        }

        /* Prevent text selection on interactive elements */
        button,
        .cursor-pointer {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        /* Focus styles for accessibility */
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-radius: 0.5rem;
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .bg-slate-50 {
            background-color: white;
          }

          .text-slate-600 {
            color: black;
          }

          .border-slate-200 {
            border-color: black;
          }
        }

        /* Dark mode support (if needed in the future) */
        @media (prefers-color-scheme: dark) {
          .bg-slate-50 {
            background-color: #f8fafc;
          }

          .bg-white {
            background-color: #ffffff;
          }

          .text-slate-800 {
            color: #1e293b;
          }

          .text-slate-600 {
            color: #475569;
          }

          .border-slate-200 {
            border-color: #e2e8f0;
          }
        }

        /* Mobile touch improvements */
        @media (hover: none) and (pointer: coarse) {
          .hover\\:scale-110:hover {
            transform: scale(1.05);
          }

          .hover\\:bg-slate-100:hover {
            background-color: #f1f5f9;
          }
        }

        /* Loading states */
        .loading {
          position: relative;
          overflow: hidden;
        }

        .loading::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        /* Tooltip improvements */
        .tooltip {
          pointer-events: none;
          z-index: 9999;
          white-space: nowrap;
          font-size: 0.875rem;
          line-height: 1.25rem;
          max-width: 200px;
          word-wrap: break-word;
        }

        /* Print styles */
        @media print {
          .sidebar,
          .mobile-overlay,
          .notification-bell,
          .profile-avatar {
            display: none !important;
          }

          .main-content {
            margin: 0 !important;
            width: 100% !important;
          }

          .page-content {
            box-shadow: none !important;
            border: none !important;
          }
        }

        /* High performance CSS for animations */
        .will-change-transform {
          will-change: transform;
        }

        .will-change-opacity {
          will-change: opacity;
        }

        .gpu-acceleration {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Custom focus styles for better UX */
        .focus-ring:focus {
          outline: none;
          box-shadow:
            0 0 0 2px #3b82f6,
            0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        /* Smooth state transitions */
        .state-transition {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Loading spinner */
        .spinner {
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

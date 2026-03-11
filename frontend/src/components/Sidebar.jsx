// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Home,
  ClipboardList,
  Ticket,
  UserPlus,
  User,
  BarChart3,
  HelpCircle,
} from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();
  const perms = usePermissions();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        bg-slate-900 text-white
        flex-shrink-0 hidden md:flex flex-col
        h-screen sticky top-0
        transition-all duration-300
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
        {!collapsed && (
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Management System
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        <NavItem
          to="/home"
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
          isActive={isActive("/home")}
          collapsed={collapsed}
        />

        <NavItem
          to="/profile"
          label="My Profile"
          icon={<User size={18} />}
          isActive={isActive("/profile")}
          collapsed={collapsed}
        />

        {/* COUNSELOR */}
        {perms.canViewTickets && user.role === "counselor" && (
          <Section title="Counseling" collapsed={collapsed}>
            <NavItem
              to="/counselor/tickets"
              label="Incoming Tickets"
              icon={<Ticket size={18} />}
              isActive={isActive("/counselor/tickets")}
              collapsed={collapsed}
            />
            <NavItem
              to="/counselor/faqs"
              label="FAQ Management"
              icon={<HelpCircle size={18} />}
              isActive={isActive("/counselor/faqs")}
              collapsed={collapsed}
            />
          </Section>
        )}

        {/* STUDENT */}
        {user.role === "student" && (
          <Section title="Student Services" collapsed={collapsed}>
            {perms.canApplyHostel && (
              <NavItem
                to="/student/application"
                label="Hostel Application"
                icon={<Home size={18} />}
                isActive={isActive("/student/application")}
                collapsed={collapsed}
              />
            )}
            {perms.canCreateTicket && (
              <NavItem
                to="/student/tickets"
                label="Counselor Support"
                icon={<Ticket size={18} />}
                isActive={isActive("/student/tickets")}
                collapsed={collapsed}
              />
            )}
          </Section>
        )}

        {/* HOSTEL ADMIN */}
        {(perms.canManageTenants || perms.canViewApplications) && (
          <Section title="Hostel Admin" collapsed={collapsed}>
            {perms.canManageTenants && (
              <NavItem
                to="/hostel/tenants"
                label="Tenant Management"
                icon={<Users size={18} />}
                isActive={isActive("/hostel/tenants")}
                collapsed={collapsed}
              />
            )}
            {perms.canViewApplications && (
              <NavItem
                to="/hostel/applications"
                label="Applications Review"
                icon={<ClipboardList size={18} />}
                isActive={isActive("/hostel/applications")}
                collapsed={collapsed}
              />
            )}
          </Section>
        )}

        {/* SYSTEM */}
        {perms.canViewUsers && (
          <Section title="System" collapsed={collapsed}>
            <NavItem
              to="/management"
              label="User Management"
              icon={<Users size={18} />}
              isActive={isActive("/management")}
              collapsed={collapsed}
            />
          </Section>
        )}

        {/* STAFF PROMOTION */}
        {perms.canRequestCounselorRole && user.role === "staff" && (
          <Section title="Career" collapsed={collapsed}>
            <NavItem
              to="/staff/request-role"
              label="Request Promotion"
              icon={<UserPlus size={18} />}
              isActive={isActive("/staff/request-role")}
              collapsed={collapsed}
            />
          </Section>
        )}

        {/* ADMIN TASKS */}
        {perms.canManageRoleRequests && (
          <Section title="Admin Tasks" collapsed={collapsed}>
            <NavItem
              to="/admin/role-requests"
              label="Role Requests"
              icon={<ClipboardList size={18} />}
              isActive={isActive("/admin/role-requests")}
              collapsed={collapsed}
            />
          </Section>
        )}

        {/* REPORTS (Admin Only) */}
        {perms.canViewReports && (
          <Section title="Reports" collapsed={collapsed}>
            <NavItem
              to="/admin/reports/applications"
              label="Application Reports"
              icon={<BarChart3 size={18} />}
              isActive={isActive("/admin/reports/applications")}
              collapsed={collapsed}
            />
            <NavItem
              to="/admin/reports/tickets"
              label="Ticket Reports"
              icon={<BarChart3 size={18} />}
              isActive={isActive("/admin/reports/tickets")}
              collapsed={collapsed}
            />
            <NavItem
              to="/admin/reports/faqs"
              label="FAQ Reports"
              icon={<HelpCircle size={18} />}
              isActive={isActive("/admin/reports/faqs")}
              collapsed={collapsed}
            />
          </Section>
        )}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          v2.1.0 © 2026
        </div>
      )}
    </aside>
  );
};

/* ---------- Helpers ---------- */

const Section = ({ title, collapsed, children }) => (
  <div className="pt-4">
    {!collapsed && (
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
        {title}
      </div>
    )}
    {children}
  </div>
);

const NavItem = ({ to, label, icon, isActive, collapsed }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-lg
      transition-all duration-200
      ${isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"}
    `}
  >
    <span>{icon}</span>
    {!collapsed && <span className="font-medium">{label}</span>}
  </Link>
);

export default Sidebar;

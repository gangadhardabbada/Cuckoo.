import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Radio,
  CircleHelp,
  Settings,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('cuckoo-sidebar-collapsed') === 'true';
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('cuckoo-sidebar-width');
    return saved ? parseInt(saved, 10) : 220;
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);

  useEffect(() => {
    const widthVal = isCollapsed ? '72px' : `${sidebarWidth}px`;
    document.documentElement.style.setProperty('--sidebar-width', widthVal);
  }, [isCollapsed, sidebarWidth]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('cuckoo-sidebar-collapsed', next ? 'true' : 'false');
      return next;
    });
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    const startWidth = sidebarWidth;
    const startX = e.clientX;

    const doResize = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startWidth + deltaX;
      if (newWidth < 180) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        const clampedWidth = Math.min(Math.max(newWidth, 200), 320);
        setSidebarWidth(clampedWidth);
        localStorage.setItem('cuckoo-sidebar-width', clampedWidth);
      }
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  const navItems = [
    { to: '/dashboard',  Icon: LayoutDashboard, label: 'Home'           },
    { to: '/broadcast',  Icon: MessageSquare,   label: 'Broadcast'      },
    { to: '/contacts',   Icon: Users,           label: 'Contacts'       },
    { to: '/campaigns',  Icon: Radio,           label: 'Campaigns'      },
    { to: '/faq',        Icon: CircleHelp,      label: 'FAQ'            },
    { to: '/settings',   Icon: Settings,        label: 'Settings'       },
    { to: '/profile',    Icon: UserCircle,      label: 'Account Center' },
  ];

  return (
    <>
      {/* Mobile Hamburger */}
      <button className="mobile-nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <nav
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{ width: mobileOpen ? '260px' : (isCollapsed ? '72px' : `${sidebarWidth}px`) }}
      >
        {/* Brand — clicking entire area toggles collapse */}
        <div
          className="sidebar-brand sidebar-brand-clickable"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && toggleCollapse()}
        >
          <div className="sidebar-brand-content">
            <div className="sidebar-logo-wrap">
              <img src="/logo.png" className="sidebar-brand-logo" alt="Cuckoo" />
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="sidebar-brand-text">
                <div className="sidebar-brand-name">Cuckoo</div>
                <div className="sidebar-brand-tag">On-Air Persona</div>
              </div>
            )}
          </div>

          {/* Subtle arrow indicator */}
          {(!isCollapsed || mobileOpen) ? (
            <ChevronLeft size={16} className="sidebar-chevron" />
          ) : (
            <ChevronRight size={16} className="sidebar-chevron sidebar-chevron-collapsed" />
          )}
        </div>

        {/* Nav Items */}
        <div className="sidebar-nav">
          {navItems.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed && !mobileOpen ? label : ''}
            >
              <span className="sidebar-link-icon">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              {(!isCollapsed || mobileOpen) && <span className="sidebar-link-label">{label}</span>}
            </NavLink>
          ))}
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            {(!isCollapsed || mobileOpen) && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name || 'User'}</div>
                <div className="sidebar-user-email">{user?.email || user?.phone || 'Cuckoo Account'}</div>
              </div>
            )}
          </div>
          <button
            className="btn btn-ghost btn-sm sidebar-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} strokeWidth={1.75} />
            {(!isCollapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>

        {/* Drag-resize handle */}
        {!mobileOpen && (
          <div
            ref={resizeRef}
            className={`sidebar-resize-handle ${isResizing ? 'resizing' : ''}`}
            onMouseDown={handleMouseDown}
          />
        )}
      </nav>
    </>
  );
}

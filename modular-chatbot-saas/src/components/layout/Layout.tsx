import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppStore } from '@/state/store';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const router = useRouter();
    const { sidebarOpen, toggleSidebar, notifications, removeNotification } = useAppStore();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResultsOpen, setSearchResultsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get user from localStorage
    const user = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user') || '{"name":"User","email":"user@example.com"}')
        : { name: 'User', email: 'user@example.com' };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '📊' },
        { name: 'Agents', path: '/agents', icon: '🤖' },
        { name: 'Knowledge Base', path: '/knowledge-base', icon: '📚' },
        { name: 'Web Widget', path: '/web-widget', icon: '🌐' },
        { name: 'Settings', path: '/settings', icon: '⚙️' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchResultsOpen(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside
                data-testid="sidebar"
                className={`${mobileMenuOpen ? 'block' : 'hidden md:block'
                    } ${sidebarOpen ? 'w-64' : 'w-20'
                    } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed md:relative h-screen z-40`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Logo" className="w-8 h-8" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            <h1 className="text-xl font-bold text-primary-600">Chatbot SaaS</h1>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = router.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        href={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-primary-100 text-primary-700 font-semibold'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {sidebarOpen && <span className="font-medium">{item.name}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Header / TopBar */}
                <header data-testid="topbar" className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            ☰
                        </button>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
                            <input
                                type="search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {searchResultsOpen && searchQuery && (
                                <div data-testid="search-results" className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg p-4">
                                    <p className="text-sm text-gray-600">Search results for "{searchQuery}"</p>
                                </div>
                            )}
                        </form>

                        {/* Right side actions */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    data-testid="notifications-bell"
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="p-2 hover:bg-gray-100 rounded-lg relative"
                                    aria-label="Notifications"
                                >
                                    🔔
                                    {notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </button>
                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
                                        <h3 className="font-semibold mb-2">Notifications</h3>
                                        {notifications.length > 0 ? (
                                            <div className="space-y-2">
                                                {notifications.map((notif) => (
                                                    <div key={notif.id} className="p-2 border-b">
                                                        <p className="text-sm">{notif.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No notifications</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    data-testid="user-menu-button"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                                    aria-label="User menu"
                                >
                                    <div className="text-left hidden sm:block">
                                        <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <span className="text-2xl">👤</span>
                                </button>
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                                        <button
                                            role="menuitem"
                                            onClick={() => router.push('/profile')}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            role="menuitem"
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">{children}</main>

                {/* Toast Notifications */}
                <div className="fixed bottom-4 right-4 space-y-2 z-50">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4 min-w-[300px] ${notification.type === 'success'
                                ? 'bg-green-500 text-white'
                                : notification.type === 'error'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-blue-500 text-white'
                                }`}
                        >
                            <span>{notification.message}</span>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="text-white hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import {
    UserPlus,
    Mail,
    Phone,
    User,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Receipt,
    FileSpreadsheet,
    Package,
    Bot,
    ShoppingCart,
    Trash2,
    Users
} from 'lucide-react';

export interface StaffUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    permissions: string[];
    createdAt: string;
}

const PERMISSION_OPTIONS = [
    { id: 'sales', label: 'Sales Management', description: 'Create and view sales transactions', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics & Reports', description: 'Access revenue & business insights', icon: TrendingUp },
    { id: 'invoices', label: 'Invoices', description: 'Generate and manage customer invoices', icon: Receipt },
    { id: 'gst_bills', label: 'GST Billing', description: 'File & view GST invoice records', icon: FileSpreadsheet },
    { id: 'inventory', label: 'Inventory Access', description: 'Add, update or delete stock items', icon: Package },
    { id: 'ai_tools', label: 'AI Features', description: 'Use AI Bill OCR & Voice listing tools', icon: Bot },
];

export function StaffMembers() {
    // Users List State
    const [users, setUsers] = useState<StaffUser[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        permissions: [] as string[],
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Form Validation
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters long';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Enter a valid 10-digit Indian phone number';
        }

        if (formData.permissions.length === 0) {
            newErrors.permissions = 'Select at least one module permission';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Toggle Checkboxes
    const handlePermissionToggle = (id: string) => {
        setFormData((prev) => {
            const exists = prev.permissions.includes(id);
            const updatedPermissions = exists
                ? prev.permissions.filter((p) => p !== id)
                : [...prev.permissions, id];

            return { ...prev, permissions: updatedPermissions };
        });
        if (errors.permissions) setErrors((prev) => ({ ...prev, permissions: '' }));
    };

    // Select/Deselect All
    const handleSelectAll = () => {
        if (formData.permissions.length === PERMISSION_OPTIONS.length) {
            setFormData((prev) => ({ ...prev, permissions: [] }));
        } else {
            setFormData((prev) => ({
                ...prev,
                permissions: PERMISSION_OPTIONS.map((p) => p.id),
            }));
        }
    };

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));

            const newUser: StaffUser = {
                id: Date.now().toString(),
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                permissions: formData.permissions,
                createdAt: new Date().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })
            };

            setUsers((prev) => [newUser, ...prev]);
            setSuccessMessage(`Staff member "${newUser.name}" added successfully!`);
            setFormData({ name: '', email: '', phone: '', permissions: [] });
            setErrors({});
        } catch (err) {
            setErrors({ api: 'Failed to create user. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete User Handler
    const handleDeleteUser = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    return (
        <div className="space-y-6">

            {/* SECTION 1: ADD USER FORM */}
            <div>
                <div className="mb-6 flex items-center gap-3 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Staff Management
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Add team members, assign permissions, and manage staff access
                        </p>
                    </div>
                </div>

                {/* Success Alert */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1: Basic Info */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" /> Basic Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Name Input */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Akash Pandey"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: '' });
                                        }}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.name
                                                ? 'border-red-500 focus:ring-red-500/20'
                                                : formData.name.trim().length >= 3
                                                    ? 'border-emerald-500 focus:ring-emerald-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                                            }`}
                                    />
                                </div>
                                {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="akash@example.com"
                                        value={formData.email}
                                        onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value });
                                            if (errors.email) setErrors({ ...errors, email: '' });
                                        }}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.email
                                                ? 'border-red-500 focus:ring-red-500/20'
                                                : formData.email && !errors.email
                                                    ? 'border-emerald-500 focus:ring-emerald-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                                            }`}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                                            if (errors.phone) setErrors({ ...errors, phone: '' });
                                        }}
                                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${errors.phone
                                                ? 'border-red-500 focus:ring-red-500/20'
                                                : formData.phone.length === 10
                                                    ? 'border-emerald-500 focus:ring-emerald-500/20'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'
                                            }`}
                                    />
                                </div>
                                {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Permissions Selection */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Module Access Control
                                </h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                    Select features this user is authorized to access
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {formData.permissions.length === PERMISSION_OPTIONS.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        {errors.permissions && (
                            <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> {errors.permissions}
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PERMISSION_OPTIONS.map((module) => {
                                const IconComponent = module.icon;
                                const isChecked = formData.permissions.includes(module.id);

                                return (
                                    <div
                                        key={module.id}
                                        onClick={() => handlePermissionToggle(module.id)}
                                        className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all select-none ${isChecked
                                                ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 dark:border-indigo-400 shadow-sm'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => { }}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 pointer-events-none"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className={`w-4 h-4 ${isChecked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {module.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {module.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" /> Save & Add Staff Member
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* SECTION 2: STAFF USERS LIST */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Active Staff Members ({users.length})
                        </h2>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No staff users created yet.</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Fill out the form above to add your first team member.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Contact</th>
                                    <th className="py-3 px-4">Permissions</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                                            {u.name}
                                            <span className="block text-xs font-normal text-slate-400">Added {u.createdAt}</span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 space-y-0.5">
                                            <div className="text-xs flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                                            </div>
                                            <div className="text-xs flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" /> {u.phone}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {u.permissions.map((pId) => {
                                                    const label = PERMISSION_OPTIONS.find((p) => p.id === pId)?.label;
                                                    return (
                                                        <span
                                                            key={pId}
                                                            className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-200/50 dark:border-indigo-800/50"
                                                        >
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}
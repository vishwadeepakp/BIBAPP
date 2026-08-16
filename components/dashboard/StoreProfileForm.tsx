'use client';

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {
    Building2,
    MapPin,
    CreditCard,
    Upload,
    X,
    CheckCircle2,
    Phone,
    Mail,
    Store,
    Landmark,
    ShieldCheck,
    QrCode,
    Loader2,
    AlertCircle
} from 'lucide-react';

import { useSaveProfile, useGetProfile } from '@/hooks/useUserApi';

// Form Data Interface
export interface StoreProfileData {
    storeName: string;
    tagline: string;
    merchantName: string;
    phone: string;
    email: string;
    gstin: string;
    pan: string;
    businessType: 'retail' | 'wholesale' | 'both';
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    city: string;
    state: string;
    stateCode: string;
    pincode: string;
    upiId: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
    branch: string;
    storeImage: string | null;
}

// Validation Error State Interface
interface FormErrors {
    [key: string]: string;
}

// Component Props Interface
interface StoreProfileFormProps {
    initialData?: Partial<StoreProfileData>;
    onSave?: (data: StoreProfileData) => void;
}

const StoreProfileForm: React.FC<StoreProfileFormProps> = ({ initialData = {}, onSave }) => {
    const [formData, setFormData] = useState<StoreProfileData>({
        storeName: initialData.storeName || '',
        tagline: initialData.tagline || '',
        merchantName: initialData.merchantName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        gstin: initialData.gstin || '',
        pan: initialData.pan || '',
        businessType: initialData.businessType || 'retail',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        landmark: initialData.landmark || '',
        city: initialData.city || '',
        state: initialData.state || 'Maharashtra',
        stateCode: initialData.stateCode || '27',
        pincode: initialData.pincode || '',
        upiId: initialData.upiId || '',
        bankName: initialData.bankName || '',
        accountNo: initialData.accountNo || '',
        ifsc: initialData.ifsc || '',
        branch: initialData.branch || '',
        storeImage: initialData.storeImage || null
    });

    const [imagePreview, setImagePreview] = useState<string | null>(initialData.storeImage || null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const saveProfile = useSaveProfile();

    const { data, isSuccess } = useGetProfile();

    useEffect(() => {
        if (isSuccess && data) {
            setFormData({
                storeName: data.storeName || '',
                tagline: data.tagline || '',
                merchantName: data.merchantName || '',
                phone: data.phone || '',
                email: data.email || '',
                businessType: data.businessType || 'retail',
                addressLine1: data.addressLine1 || '',
                addressLine2: data.addressLine2 || '',
                landmark: data.landmark || '',
                city: data.city || '',
                state: data.state || 'Maharashtra',
                pincode: data.pincode || '',
                gstin: data.gstin || '',
                pan: data.pan || '',
                upiId: data.upiId || '',
                bankName: data.bankName || '',
                accountNo: data.accountNo || '',
                ifsc: data.ifsc || '',
                branch: data.branch || '',
            });
        }
    }, [data, isSuccess]);

    // Field Validation Helper Function
    const validateField = (name: string, value: string): string => {
        let error = '';
        switch (name) {
            case 'storeName':
                if (!value.trim()) error = 'Store name is required.';
                break;
            case 'merchantName':
                if (!value.trim()) error = 'Owner / Merchant name is required.';
                break;
            case 'phone':
                if (!value.trim()) {
                    error = 'Mobile number is required.';
                } else if (!/^[6-9]\d{9}$/.test(value.replace(/\D/g, ''))) {
                    error = 'Please enter a valid 10-digit mobile number.';
                }
                break;
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Invalid email address.';
                }
                break;
            case 'addressLine1':
                if (!value.trim()) error = 'Address Line 1 is required.';
                break;
            case 'city':
                if (!value.trim()) error = 'City is required.';
                break;
            case 'state':
                if (!value.trim()) error = 'State is required.';
                break;
            case 'pincode':
                if (!value.trim()) {
                    error = 'PIN code is required.';
                } else if (!/^\d{6}$/.test(value)) {
                    error = 'Enter a valid 6-digit PIN code.';
                }
                break;
            case 'gstin':
                if (value && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
                    error = 'Invalid GSTIN format (e.g., 27AAAAA0000A1Z5).';
                }
                break;
            case 'pan':
                if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
                    error = 'Invalid PAN format (e.g., AAAAA0000A).';
                }
                break;
            case 'upiId':
                if (value && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value)) {
                    error = 'Invalid UPI ID format (e.g., merchant@upi).';
                }
                break;
            case 'ifsc':
                if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) {
                    error = 'Invalid IFSC code (e.g., SBIN0000123).';
                }
                break;
            default:
                break;
        }
        return error;
    };

    // Full Form Validation Check
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        Object.keys(formData).forEach((key) => {
            const val = formData[key as keyof StoreProfileData];
            if (typeof val === 'string') {
                const err = validateField(key, val);
                if (err) newErrors[key] = err;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Generic Input Change Handler
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'gstin' || name === 'pan' || name === 'ifsc') {
            formattedValue = value.toUpperCase();
        }

        setFormData((prev) => ({ ...prev, [name]: formattedValue }));

        // Real-time Validation Error Removal
        const errorMsg = validateField(name, formattedValue);
        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    };

    // Image Upload Handler
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, storeImage: 'File size should be less than 5MB.' }));
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setFormData((prev) => ({ ...prev, storeImage: result }));
                setErrors((prev) => ({ ...prev, storeImage: '' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData((prev) => ({ ...prev, storeImage: null }));
    };

    // Form Submit Handler with Dummy API Call
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await saveProfile.mutateAsync(formData)

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 4000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setApiError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate UPI QR Code URL for preview
    const generateUpiQrUrl = (upiId: string, merchantName: string) => {
        if (!upiId || errors.upiId) return null;
        const payeeName = encodeURIComponent(merchantName || 'Store Merchant');
        const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${payeeName}&cu=INR`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;
    };

    const upiQrCodeUrl = generateUpiQrUrl(formData.upiId, formData.merchantName);

    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="mb-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <Store className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Store Profile & Invoice Setup</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Enter your store details. This information will be printed on your GST and retail invoices.
                        </p>
                    </div>
                </div>

                {isSaved && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Store settings saved successfully!
                    </div>
                )}

                {apiError && (
                    <div className="flex items-center gap-2 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 px-3 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        {apiError}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Business Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                        <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Business Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Logo Upload */}
                        <div className="md:col-span-1 flex flex-col items-center justify-center">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 w-full text-left">
                                Shop Photo / Logo (Optional)
                            </label>

                            <div className="w-full h-44 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/50 transition">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Store Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-full hover:bg-red-600 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-4">
                                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-600 dark:text-slate-400 text-center font-medium">
                                            Click to upload shop logo or photo
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                            {errors.storeImage && (
                                <p className="text-[11px] text-red-500 mt-1 self-start">{errors.storeImage}</p>
                            )}
                        </div>

                        {/* Business Fields */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Store / Shop Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    placeholder="e.g. Vindhyawasini Traders"
                                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.storeName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                                />
                                {errors.storeName && <p className="text-[11px] text-red-500 mt-1">{errors.storeName}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Tagline / Business Subtitle
                                </label>
                                <input
                                    type="text"
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    placeholder="e.g. Wholesale & Retail Agri Products"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Owner / Merchant Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="merchantName"
                                    value={formData.merchantName}
                                    onChange={handleChange}
                                    placeholder="e.g. Ramesh Kumar"
                                    className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.merchantName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                                />
                                {errors.merchantName && <p className="text-[11px] text-red-500 mt-1">{errors.merchantName}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Business Type
                                </label>
                                <select
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                >
                                    <option value="retail">Retailer Only</option>
                                    <option value="wholesale">Wholesaler Only</option>
                                    <option value="both">Both Retail & Wholesale</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Mobile / Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                                    />
                                </div>
                                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                    Business Email (Optional)
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="contact@store.com"
                                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                                    />
                                </div>
                                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Multi-Line Address Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                        <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Store Address Details</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 md:col-span-3">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Address Line 1 (Shop No, Building Name, Street) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                placeholder="Shop No. 12, Main Market Road"
                                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.addressLine1 ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                            />
                            {errors.addressLine1 && <p className="text-[11px] text-red-500 mt-1">{errors.addressLine1}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Address Line 2 (Area, Colony, Post)
                            </label>
                            <input
                                type="text"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                placeholder="Near Grain Market Chowk"
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Landmark
                            </label>
                            <div className="relative">
                                <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input
                                    type="text"
                                    name="landmark"
                                    value={formData.landmark}
                                    onChange={handleChange}
                                    placeholder="Opp. SBI Main Branch"
                                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                City / Town <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Solapur"
                                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                            />
                            {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                State & Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="Maharashtra (27)"
                                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.state ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                            />
                            {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                PIN Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                maxLength={6}
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="413001"
                                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none`}
                            />
                            {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
                        </div>
                    </div>
                </div>

                {/* Legal & Tax Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Tax & Legal Registrations</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                GSTIN Number (Optional for Non-GST Shops)
                            </label>
                            <input
                                type="text"
                                name="gstin"
                                maxLength={15}
                                value={formData.gstin}
                                onChange={handleChange}
                                placeholder="27AAAAA0000A1Z5"
                                className={`w-full px-3 py-2 text-sm uppercase rounded-lg border ${errors.gstin ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none font-mono`}
                            />
                            {errors.gstin && <p className="text-[11px] text-red-500 mt-1">{errors.gstin}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                PAN Card Number
                            </label>
                            <input
                                type="text"
                                name="pan"
                                maxLength={10}
                                value={formData.pan}
                                onChange={handleChange}
                                placeholder="AAAAA0000A"
                                className={`w-full px-3 py-2 text-sm uppercase rounded-lg border ${errors.pan ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none font-mono`}
                            />
                            {errors.pan && <p className="text-[11px] text-red-500 mt-1">{errors.pan}</p>}
                        </div>
                    </div>
                </div>

                {/* Payment & Bank Details Section (Includes UPI ID & Live QR Preview) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Payments & Bank Details</h2>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            For Invoice Payments
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Left/Main Form Fields: UPI & Bank Details */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* UPI ID Field */}
                            <div className="sm:col-span-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                                    UPI ID / VPA (For Dynamic Invoice QR Code)
                                </label>
                                <div className="relative">
                                    <QrCode className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={formData.upiId}
                                        onChange={handleChange}
                                        placeholder="e.g. 9876543210@paytm, merchant@okaxis"
                                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${errors.upiId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none font-mono`}
                                    />
                                </div>
                                {errors.upiId ? (
                                    <p className="text-[11px] text-red-500 mt-1">{errors.upiId}</p>
                                ) : (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Enter your PhonePe, Google Pay, or Paytm UPI ID to receive direct customer payments.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    placeholder="e.g. State Bank of India"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    name="accountNo"
                                    value={formData.accountNo}
                                    onChange={handleChange}
                                    placeholder="e.g. 30981234567"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
                                <input
                                    type="text"
                                    name="ifsc"
                                    maxLength={11}
                                    value={formData.ifsc}
                                    onChange={handleChange}
                                    placeholder="e.g. SBIN0000123"
                                    className={`w-full px-3 py-2 text-sm uppercase rounded-lg border ${errors.ifsc ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:outline-none font-mono`}
                                />
                                {errors.ifsc && <p className="text-[11px] text-red-500 mt-1">{errors.ifsc}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    placeholder="e.g. Main Branch, Solapur"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Right Column: Live QR Code Preview */}
                        <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                                Invoice Payment QR Preview
                            </span>

                            {upiQrCodeUrl ? (
                                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                                    <img
                                        src={upiQrCodeUrl}
                                        alt="UPI Payment QR Code"
                                        className="w-36 h-36 object-contain"
                                    />
                                    <span className="text-[10px] font-mono text-slate-600 mt-2 truncate max-w-[140px]">
                                        {formData.upiId}
                                    </span>
                                </div>
                            ) : (
                                <div className="w-36 h-36 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-3 text-slate-400">
                                    <QrCode className="w-10 h-10 mb-1 opacity-50" />
                                    <span className="text-[10px]">QR Code will appear when UPI ID is entered</span>
                                </div>
                            )}

                            <p className="text-[11px] text-slate-400 mt-3">
                                This QR code will be rendered at the bottom of printed invoices and receipts.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Save Store Settings
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default StoreProfileForm;
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/state/store';
import { agentApi } from '@/services/api';

/**
 * Settings Page
 * Configure platform API keys, language preferences, and fallback responses
 * Features: API key management, language settings, fallback configuration, profile settings
 */
export default function SettingsPage() {
    const { addNotification } = useAppStore();
    const [activeTab, setActiveTab] = useState<'api-keys' | 'language' | 'fallback' | 'profile'>('api-keys');
    const [isSaving, setIsSaving] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Configure your chatbot platform settings and preferences
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('api-keys')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'api-keys'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        🔑 API Keys
                    </button>
                    <button
                        onClick={() => setActiveTab('language')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'language'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        🌐 Language
                    </button>
                    <button
                        onClick={() => setActiveTab('fallback')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'fallback'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        💬 Fallback Responses
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === 'profile'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        👤 Profile
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'api-keys' && <ApiKeysSettings />}
                {activeTab === 'language' && <LanguageSettings />}
                {activeTab === 'fallback' && <FallbackSettings />}
                {activeTab === 'profile' && <ProfileSettings />}
            </div>
        </div>
    );
}

/**
 * API Keys Settings Component
 * Manage platform API keys (WhatsApp, Instagram, OpenAI)
 */
function ApiKeysSettings() {
    const { addNotification } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const [showKeys, setShowKeys] = useState({
        whatsapp: false,
        instagram: false,
        openai: false,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            whatsappApiKey: '',
            whatsappPhoneNumberId: '',
            whatsappBusinessAccountId: '',
            instagramAccessToken: '',
            instagramBusinessAccountId: '',
            openaiApiKey: '',
        },
    });

    /**
     * Save API keys
     */
    const onSubmit = async (data: any) => {
        try {
            setIsSaving(true);
            // TODO: Implement settings API
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification('API keys saved successfully', 'success');
        } catch (error) {
            addNotification('Failed to save API keys', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Toggle key visibility
     */
    const toggleVisibility = (platform: keyof typeof showKeys) => {
        setShowKeys(prev => ({ ...prev, [platform]: !prev[platform] }));
    };

    return (
        <div className="max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* WhatsApp API Keys */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                            📱
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">WhatsApp Business API</h2>
                            <p className="text-sm text-gray-600">
                                Configure WhatsApp Business API credentials
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="label">API Key / Access Token</label>
                            <div className="relative">
                                <input
                                    type={showKeys.whatsapp ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="Enter WhatsApp API key"
                                    {...register('whatsappApiKey', {
                                        required: 'WhatsApp API key is required',
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('whatsapp')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showKeys.whatsapp ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.whatsappApiKey && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.whatsappApiKey.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Phone Number ID</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., 123456789012345"
                                {...register('whatsappPhoneNumberId')}
                            />
                        </div>

                        <div>
                            <label className="label">Business Account ID</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., 987654321098765"
                                {...register('whatsappBusinessAccountId')}
                            />
                        </div>
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            💡 Get your WhatsApp API credentials from{' '}
                            <a
                                href="https://developers.facebook.com/apps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline"
                            >
                                Meta for Developers
                            </a>
                        </p>
                    </div>
                </div>

                {/* Instagram API Keys */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">
                            📸
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Instagram Messaging API</h2>
                            <p className="text-sm text-gray-600">
                                Configure Instagram Business API credentials
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="label">Access Token</label>
                            <div className="relative">
                                <input
                                    type={showKeys.instagram ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="Enter Instagram access token"
                                    {...register('instagramAccessToken', {
                                        required: 'Instagram access token is required',
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('instagram')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showKeys.instagram ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.instagramAccessToken && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.instagramAccessToken.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Instagram Business Account ID</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., 17841400008460056"
                                {...register('instagramBusinessAccountId')}
                            />
                        </div>
                    </div>

                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            💡 Instagram access tokens can be generated from your{' '}
                            <a
                                href="https://developers.facebook.com/apps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium underline"
                            >
                                Facebook App Dashboard
                            </a>
                        </p>
                    </div>
                </div>

                {/* OpenAI API Key (Optional) */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                            🤖
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">OpenAI API (Optional)</h2>
                            <p className="text-sm text-gray-600">
                                Alternative to local Gemma 4b for LLM inference
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="label">OpenAI API Key</label>
                            <div className="relative">
                                <input
                                    type={showKeys.openai ? 'text' : 'password'}
                                    className="input pr-12"
                                    placeholder="sk-..."
                                    {...register('openaiApiKey')}
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('openai')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showKeys.openai ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ⚠️ This is optional. The platform uses Gemma 4b by default. Only add if you want to use OpenAI models.
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary px-8"
                    >
                        {isSaving ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving...
                            </>
                        ) : (
                            '💾 Save API Keys'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

/**
 * Language Settings Component
 * Configure default language preferences
 */
function LanguageSettings() {
    const { addNotification } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            defaultLanguage: 'english',
            autoDetectLanguage: true,
            supportedLanguages: ['english', 'nepali'],
            translationEnabled: false,
        },
    });

    const autoDetect = watch('autoDetectLanguage');

    /**
     * Save language settings
     */
    const onSubmit = async (data: any) => {
        try {
            setIsSaving(true);
            // TODO: Implement settings API
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification('Language settings saved successfully', 'success');
        } catch (error) {
            addNotification('Failed to save language settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        🌐 Language Configuration
                    </h2>

                    <div className="space-y-5">
                        {/* Auto-detect Language */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id="autoDetectLanguage"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    {...register('autoDetectLanguage')}
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="autoDetectLanguage" className="font-medium text-gray-900">
                                    Auto-detect user language
                                </label>
                                <p className="text-sm text-gray-600">
                                    Automatically detect the language of incoming messages and respond accordingly
                                </p>
                            </div>
                        </div>

                        {/* Default Language */}
                        <div>
                            <label className="label">
                                Default Language {autoDetect && '(Fallback)'}
                            </label>
                            <select
                                className="input"
                                {...register('defaultLanguage', {
                                    required: 'Default language is required',
                                })}
                            >
                                <option value="english">English</option>
                                <option value="nepali">Nepali (नेपाली)</option>
                                <option value="mixed">Mixed (English + Nepali)</option>
                            </select>
                            {errors.defaultLanguage && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.defaultLanguage.message}
                                </p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                {autoDetect
                                    ? 'Used when language detection fails'
                                    : 'All responses will be in this language'}
                            </p>
                        </div>

                        {/* Supported Languages */}
                        <div>
                            <label className="label">Supported Languages</label>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="lang-english"
                                        value="english"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        {...register('supportedLanguages')}
                                    />
                                    <label htmlFor="lang-english" className="ml-2 text-sm text-gray-700">
                                        English
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="lang-nepali"
                                        value="nepali"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        {...register('supportedLanguages')}
                                    />
                                    <label htmlFor="lang-nepali" className="ml-2 text-sm text-gray-700">
                                        Nepali (नेपाली)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="lang-mixed"
                                        value="mixed"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        {...register('supportedLanguages')}
                                    />
                                    <label htmlFor="lang-mixed" className="ml-2 text-sm text-gray-700">
                                        Mixed (English + Nepali)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Translation (Future Feature) */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id="translationEnabled"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    {...register('translationEnabled')}
                                    disabled
                                />
                            </div>
                            <div className="ml-3">
                                <label htmlFor="translationEnabled" className="font-medium text-gray-400">
                                    Enable automatic translation (Coming Soon)
                                </label>
                                <p className="text-sm text-gray-500">
                                    Translate responses between Nepali and English automatically
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                            ℹ️ How Language Detection Works
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• LLM analyzes incoming messages to detect language</li>
                            <li>• Responses are generated in the same language as the input</li>
                            <li>• Mixed language (Nepali + English) is supported</li>
                            <li>• Fallback to default language if detection confidence is low</li>
                        </ul>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary px-8"
                    >
                        {isSaving ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving...
                            </>
                        ) : (
                            '💾 Save Language Settings'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

/**
 * Fallback Responses Settings Component
 * Configure fallback messages for error scenarios
 */
function FallbackSettings() {
    const { addNotification } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            noKnowledgeBase: 'I apologize, but I don\'t have enough information to answer that question.',
            errorResponse: 'Sorry, I encountered an error. Please try again.',
            outOfScope: 'I can only help with topics related to our services. Please ask something else.',
            agentOffline: 'Our chatbot is currently offline. Please try again later.',
            queueFull: 'We\'re experiencing high volume. Your message will be answered shortly.',
            nepaliNoKB: 'माफ गर्नुहोस्, मसँग त्यो प्रश्नको जवाफ दिन पर्याप्त जानकारी छैन।',
            nepaliError: 'माफ गर्नुहोस्, त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।',
            nepaliOffline: 'हाम्रो च्याटबोट अहिले अफलाइन छ। कृपया पछि प्रयास गर्नुहोस्।',
        },
    });

    /**
     * Save fallback settings
     */
    const onSubmit = async (data: any) => {
        try {
            setIsSaving(true);
            // TODO: Implement settings API
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification('Fallback responses saved successfully', 'success');
        } catch (error) {
            addNotification('Failed to save fallback responses', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* English Fallback Messages */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        💬 English Fallback Messages
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="label">No Knowledge Base Found</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="Message when agent has no relevant knowledge"
                                {...register('noKnowledgeBase', {
                                    required: 'This field is required',
                                })}
                            />
                            {errors.noKnowledgeBase && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.noKnowledgeBase.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Error Response</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="Generic error message"
                                {...register('errorResponse', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>

                        <div>
                            <label className="label">Out of Scope Question</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="Message for questions outside chatbot's domain"
                                {...register('outOfScope', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>

                        <div>
                            <label className="label">Agent Offline</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="Message when agent is not running"
                                {...register('agentOffline', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>

                        <div>
                            <label className="label">Queue Full</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="Message when queue is at capacity"
                                {...register('queueFull', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>
                    </div>
                </div>

                {/* Nepali Fallback Messages */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        💬 Nepali Fallback Messages (नेपाली)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="label">No Knowledge Base (नेपाली)</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="ज्ञान आधार नभेटिएको सन्देश"
                                {...register('nepaliNoKB', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>

                        <div>
                            <label className="label">Error Response (नेपाली)</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="त्रुटि सन्देश"
                                {...register('nepaliError', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>

                        <div>
                            <label className="label">Agent Offline (नेपाली)</label>
                            <textarea
                                className="input"
                                rows={2}
                                placeholder="एजेन्ट अफलाइन सन्देश"
                                {...register('nepaliOffline', {
                                    required: 'This field is required',
                                })}
                            />
                        </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Make sure fallback messages are clear and professional. They are shown when the LLM cannot generate a proper response.
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary px-8"
                    >
                        {isSaving ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving...
                            </>
                        ) : (
                            '💾 Save Fallback Responses'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

/**
 * Profile Settings Component
 * User profile and account settings
 */
function ProfileSettings() {
    const { addNotification } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: 'John Doe',
            email: 'john@example.com',
            company: 'My Business',
            timezone: 'Asia/Kathmandu',
            emailNotifications: true,
            weeklyReport: true,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const newPassword = watch('newPassword');

    /**
     * Save profile settings
     */
    const onSubmit = async (data: any) => {
        if (data.newPassword && data.newPassword !== data.confirmPassword) {
            addNotification('Passwords do not match', 'error');
            return;
        }

        try {
            setIsSaving(true);
            // TODO: Implement settings API
            await new Promise(resolve => setTimeout(resolve, 1000));
            addNotification('Profile updated successfully', 'success');
        } catch (error) {
            addNotification('Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Information */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        👤 Profile Information
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="label">Full Name</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="John Doe"
                                {...register('name', { required: 'Name is required' })}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="john@example.com"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Company / Organization</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="My Business"
                                {...register('company')}
                            />
                        </div>

                        <div>
                            <label className="label">Timezone</label>
                            <select className="input" {...register('timezone')}>
                                <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                                <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                                <option value="UTC">UTC (GMT+0:00)</option>
                                <option value="America/New_York">America/New_York (GMT-5:00)</option>
                                <option value="Europe/London">Europe/London (GMT+0:00)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        🔔 Notification Preferences
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="emailNotifications"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                {...register('emailNotifications')}
                            />
                            <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                                Email notifications for important events
                            </label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="weeklyReport"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                {...register('weeklyReport')}
                            />
                            <label htmlFor="weeklyReport" className="ml-2 text-sm text-gray-700">
                                Weekly performance reports
                            </label>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        🔒 Change Password
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="label">Current Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter current password"
                                {...register('currentPassword')}
                            />
                        </div>

                        <div>
                            <label className="label">New Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter new password"
                                {...register('newPassword', {
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters',
                                    },
                                })}
                            />
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">Confirm New Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Confirm new password"
                                {...register('confirmPassword')}
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-600">
                        Leave password fields empty if you don't want to change it
                    </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="btn-primary px-8"
                    >
                        {isSaving ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving...
                            </>
                        ) : (
                            '💾 Save Profile'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

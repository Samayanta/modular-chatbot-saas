import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppStore } from '@/state/store';
import { agentApi } from '@/services/api';
import { Agent } from '@/types';

/**
 * Web Widget Management Page
 * Generate embeddable chatbot widgets for websites
 * Features: Snippet generation, customization, live preview, copy-to-clipboard
 */
export default function WebWidgetPage() {
    const { agents, addNotification } = useAppStore();
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
        position: 'bottom-right',
        primaryColor: '#3B82F6',
        greeting: 'Hello! How can I help you today?',
        placeholder: 'Type your message...',
        title: 'Chat with us',
        subtitle: 'We typically reply in a few minutes',
        avatar: '',
        showPoweredBy: true,
    });

    /**
     * Load agents on mount
     */
    useEffect(() => {
        loadAgents();
    }, []);

    /**
     * Fetch all agents
     */
    const loadAgents = async () => {
        try {
            const data = await agentApi.getAll();
            useAppStore.setState({ agents: data });
            // Auto-select first agent
            const websiteAgent = data.find(a => a.platform === 'website') || data[0];
            if (websiteAgent) {
                setSelectedAgent(websiteAgent);
            }
        } catch (error) {
            console.error('Failed to load agents:', error);
            addNotification('Failed to load agents', 'error');
        }
    };

    /**
     * Generate embed script snippet
     */
    const generateSnippet = () => {
        if (!selectedAgent) return '';

        const config = JSON.stringify(widgetConfig, null, 2);

        return `<!-- Chatbot Widget -->
<script>
  window.chatbotConfig = ${config};
  window.chatbotAgentId = '${selectedAgent.id}';
</script>
<script src="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/widget.js" async></script>
<!-- End Chatbot Widget -->`;
    };

    /**
     * Copy snippet to clipboard
     */
    const handleCopySnippet = async () => {
        const snippet = generateSnippet();
        try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            addNotification('Snippet copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            addNotification('Failed to copy snippet', 'error');
        }
    };

    /**
     * Update widget configuration
     */
    const handleConfigUpdate = (key: keyof WidgetConfig, value: any) => {
        setWidgetConfig(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Web Widget</h1>
                    <p className="text-gray-600 mt-1">
                        Embed your chatbot on any website with a simple script
                    </p>
                </div>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-primary"
                >
                    {showPreview ? '👁️ Hide Preview' : '👁️ Show Live Preview'}
                </button>
            </div>

            {/* Agent Selector */}
            <div className="card">
                <label className="label">Select Agent for Widget</label>
                <select
                    className="input max-w-md"
                    value={selectedAgent?.id || ''}
                    onChange={(e) => {
                        const agent = agents.find(a => a.id === e.target.value);
                        setSelectedAgent(agent || null);
                    }}
                >
                    <option value="">-- Select an agent --</option>
                    {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.platform}) - {agent.status}
                        </option>
                    ))}
                </select>

                {selectedAgent && (
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${selectedAgent.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {selectedAgent.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Language:</span>
                            <span className="text-sm font-medium capitalize">
                                {selectedAgent.language}
                            </span>
                        </div>
                    </div>
                )}

                {selectedAgent?.status !== 'active' && selectedAgent && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ This agent is currently inactive. Start the agent to enable live chat functionality.
                        </p>
                    </div>
                )}
            </div>

            {!selectedAgent ? (
                <div className="card text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Select an agent to generate widget
                    </h3>
                    <p className="text-gray-600">
                        Choose an agent from the dropdown above to customize and embed your chatbot
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Customization */}
                    <div className="space-y-6">
                        <WidgetCustomization
                            config={widgetConfig}
                            onUpdate={handleConfigUpdate}
                        />

                        <CodeSnippet
                            snippet={generateSnippet()}
                            copied={copied}
                            onCopy={handleCopySnippet}
                        />

                        <InstallationGuide />
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:sticky lg:top-6 h-fit">
                        <WidgetPreview
                            agent={selectedAgent}
                            config={widgetConfig}
                            isVisible={showPreview}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Widget Configuration Interface
 */
interface WidgetConfig {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    primaryColor: string;
    greeting: string;
    placeholder: string;
    title: string;
    subtitle: string;
    avatar: string;
    showPoweredBy: boolean;
}

/**
 * Widget Customization Component
 * Form for customizing widget appearance and behavior
 */
interface WidgetCustomizationProps {
    config: WidgetConfig;
    onUpdate: (key: keyof WidgetConfig, value: any) => void;
}

function WidgetCustomization({ config, onUpdate }: WidgetCustomizationProps) {
    return (
        <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                🎨 Customize Widget
            </h2>

            <div className="space-y-5">
                {/* Position */}
                <div>
                    <label className="label">Widget Position</label>
                    <select
                        className="input"
                        value={config.position}
                        onChange={(e) => onUpdate('position', e.target.value)}
                    >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                    </select>
                </div>

                {/* Primary Color */}
                <div>
                    <label className="label">Primary Color</label>
                    <div className="flex gap-3">
                        <input
                            type="color"
                            className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                            value={config.primaryColor}
                            onChange={(e) => onUpdate('primaryColor', e.target.value)}
                        />
                        <input
                            type="text"
                            className="input flex-1"
                            value={config.primaryColor}
                            onChange={(e) => onUpdate('primaryColor', e.target.value)}
                            placeholder="#3B82F6"
                        />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="label">Chat Title</label>
                    <input
                        type="text"
                        className="input"
                        value={config.title}
                        onChange={(e) => onUpdate('title', e.target.value)}
                        placeholder="Chat with us"
                    />
                </div>

                {/* Subtitle */}
                <div>
                    <label className="label">Subtitle</label>
                    <input
                        type="text"
                        className="input"
                        value={config.subtitle}
                        onChange={(e) => onUpdate('subtitle', e.target.value)}
                        placeholder="We typically reply in a few minutes"
                    />
                </div>

                {/* Greeting Message */}
                <div>
                    <label className="label">Greeting Message</label>
                    <textarea
                        className="input"
                        rows={3}
                        value={config.greeting}
                        onChange={(e) => onUpdate('greeting', e.target.value)}
                        placeholder="Hello! How can I help you today?"
                    />
                </div>

                {/* Input Placeholder */}
                <div>
                    <label className="label">Input Placeholder</label>
                    <input
                        type="text"
                        className="input"
                        value={config.placeholder}
                        onChange={(e) => onUpdate('placeholder', e.target.value)}
                        placeholder="Type your message..."
                    />
                </div>

                {/* Avatar URL */}
                <div>
                    <label className="label">Avatar URL (Optional)</label>
                    <input
                        type="url"
                        className="input"
                        value={config.avatar}
                        onChange={(e) => onUpdate('avatar', e.target.value)}
                        placeholder="https://example.com/avatar.png"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Leave empty for default avatar
                    </p>
                </div>

                {/* Show Powered By */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="showPoweredBy"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={config.showPoweredBy}
                        onChange={(e) => onUpdate('showPoweredBy', e.target.checked)}
                    />
                    <label htmlFor="showPoweredBy" className="ml-2 text-sm text-gray-700">
                        Show "Powered by ChatBot SaaS" badge
                    </label>
                </div>
            </div>
        </div>
    );
}

/**
 * Code Snippet Component
 * Display and copy embed code
 */
interface CodeSnippetProps {
    snippet: string;
    copied: boolean;
    onCopy: () => void;
}

function CodeSnippet({ snippet, copied, onCopy }: CodeSnippetProps) {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    📝 Embed Code
                </h2>
                <button
                    onClick={onCopy}
                    className={`btn-primary ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                    {copied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
            </div>

            <div className="relative">
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm">
                    <code>{snippet}</code>
                </pre>
            </div>

            <p className="mt-3 text-sm text-gray-600">
                Copy this code and paste it before the closing{' '}
                <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">&lt;/body&gt;</code>{' '}
                tag in your HTML
            </p>
        </div>
    );
}

/**
 * Installation Guide Component
 * Step-by-step instructions
 */
function InstallationGuide() {
    return (
        <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
                📚 Installation Guide
            </h3>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        1
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Copy the embed code</h4>
                        <p className="text-sm text-blue-800 mt-1">
                            Click the "Copy Code" button above to copy the widget snippet
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        2
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Paste in your website</h4>
                        <p className="text-sm text-blue-800 mt-1">
                            Add the code before the closing{' '}
                            <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">&lt;/body&gt;</code>{' '}
                            tag in your HTML
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        3
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Test the widget</h4>
                        <p className="text-sm text-blue-800 mt-1">
                            Reload your website and you'll see the chatbot in the selected position
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        4
                    </div>
                    <div>
                        <h4 className="font-medium text-blue-900">Ensure agent is active</h4>
                        <p className="text-sm text-blue-800 mt-1">
                            Make sure your agent is running to respond to messages
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-300">
                <h4 className="font-medium text-blue-900 mb-2">Platform-specific guides:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• <strong>WordPress:</strong> Use a custom HTML widget or theme footer</li>
                    <li>• <strong>Shopify:</strong> Add to theme.liquid file</li>
                    <li>• <strong>React/Next.js:</strong> Add to _app.tsx or layout component</li>
                    <li>• <strong>Webflow:</strong> Add to site-wide footer code</li>
                </ul>
            </div>
        </div>
    );
}

/**
 * Widget Preview Component
 * Live preview of the chatbot widget
 */
interface WidgetPreviewProps {
    agent: Agent;
    config: WidgetConfig;
    isVisible: boolean;
}

function WidgetPreview({ agent, config, isVisible }: WidgetPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: config.greeting,
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);

    /**
     * Reset messages when greeting changes
     */
    useEffect(() => {
        setMessages([
            {
                id: '1',
                text: config.greeting,
                sender: 'bot',
                timestamp: new Date(),
            },
        ]);
    }, [config.greeting]);

    /**
     * Send message to chatbot
     */
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isSending) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsSending(true);

        try {
            // TODO: Replace with actual API call
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: `Thanks for your message! This is a preview response. In production, your ${agent.language} agent will respond based on its knowledge base and LLM processing.`,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    /**
     * Handle Enter key press
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    /**
     * Get position classes
     */
    const getPositionClasses = () => {
        switch (config.position) {
            case 'bottom-right':
                return 'bottom-6 right-6';
            case 'bottom-left':
                return 'bottom-6 left-6';
            case 'top-right':
                return 'top-6 right-6';
            case 'top-left':
                return 'top-6 left-6';
            default:
                return 'bottom-6 right-6';
        }
    };

    if (!isVisible) {
        return (
            <div className="card text-center py-12">
                <div className="text-6xl mb-4">👁️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Preview Hidden
                </h3>
                <p className="text-gray-600">
                    Click "Show Live Preview" to see how your widget will look
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                👁️ Live Preview
            </h2>

            {/* Preview Container */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 h-[600px] overflow-hidden">
                {/* Sample Website Background */}
                <div className="p-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>

                {/* Widget */}
                <div className={`fixed ${getPositionClasses()} z-50`}>
                    {/* Chat Window */}
                    {isOpen && (
                        <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col h-[500px] animate-scale-in">
                            {/* Header */}
                            <div
                                className="px-4 py-3 rounded-t-2xl text-white flex items-center justify-between"
                                style={{ backgroundColor: config.primaryColor }}
                            >
                                <div className="flex items-center gap-3">
                                    {config.avatar ? (
                                        <img
                                            src={config.avatar}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xl">
                                            🤖
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold">{config.title}</h3>
                                        <p className="text-xs opacity-90">{config.subtitle}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                                                    ? 'text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                            style={
                                                message.sender === 'user'
                                                    ? { backgroundColor: config.primaryColor }
                                                    : undefined
                                            }
                                        >
                                            <p className="text-sm">{message.text}</p>
                                            <p className={`text-xs mt-1 ${message.sender === 'user'
                                                    ? 'text-white text-opacity-75'
                                                    : 'text-gray-500'
                                                }`}>
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {isSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={config.placeholder}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                        style={{ focusRingColor: config.primaryColor }}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isSending}
                                        className="px-4 py-2 rounded-full text-white font-medium disabled:opacity-50"
                                        style={{ backgroundColor: config.primaryColor }}
                                    >
                                        ➤
                                    </button>
                                </div>
                                {config.showPoweredBy && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Powered by ChatBot SaaS
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-14 h-14 rounded-full text-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center text-2xl"
                        style={{ backgroundColor: config.primaryColor }}
                    >
                        {isOpen ? '✕' : '💬'}
                    </button>
                </div>
            </div>

            <p className="text-sm text-gray-600 mt-4">
                This is how your widget will appear on your website. Try sending a message!
            </p>
        </div>
    );
}

/**
 * Chat Message Interface
 */
interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

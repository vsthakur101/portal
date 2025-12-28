'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Download, Github, Copy, ChevronDown, ChevronUp, Camera, Bold, Italic, List, Code } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [showStackTrace, setShowStackTrace] = useState(false);
  const [copied, setCopied] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [userReport, setUserReport] = useState('');

  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  const captureScreenshot = async () => {
    try {
      if (typeof window !== 'undefined' && 'html2canvas' in window) {
        // Note: In a real app, you'd import html2canvas
        // For now, we'll simulate it
        alert('Screenshot functionality requires html2canvas library. Install it with: npm install html2canvas');
      } else {
        // Fallback: Use clipboard API if available
        alert('Screenshot capture is being simulated. In production, integrate html2canvas or use Canvas API.');
        setScreenshot('data:image/png;base64,simulated-screenshot');
      }
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  };

  const downloadErrorReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest
      },
      userReport,
      userAgent: navigator.userAgent,
      url: window.location.href,
      screenshot: screenshot || 'No screenshot captured'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const createGithubIssue = () => {
    const title = encodeURIComponent(`Error: ${error.message}`);
    const body = encodeURIComponent(`## Error Report

**Error Message:** ${error.message}

**Error Type:** ${error.name}

**Digest:** ${error.digest || 'N/A'}

**User Report:**
${userReport || 'No additional information provided'}

**Stack Trace:**
\`\`\`
${error.stack}
\`\`\`

**Environment:**
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}

${screenshot ? '**Screenshot:** Attached separately' : '**Screenshot:** Not captured'}`);

    // Replace with your GitHub repo
    const githubUrl = `https://github.com/vsthakur101/portal/issues/new?title=${title}&body=${body}`;
    window.open(githubUrl, '_blank');
  };

  const copyToClipboard = async () => {
    const text = `Error: ${error.message}\n\nStack Trace:\n${error.stack}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('userReport') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = userReport.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'list':
        formattedText = `- ${selectedText}`;
        break;
    }

    const newText = userReport.substring(0, start) + formattedText + userReport.substring(end);
    setUserReport(newText);
    
    // Refocus and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Something went wrong!</h1>
          </div>
          <p className="text-red-50 text-sm">
            Don't worry, we've logged this error and you can help us fix it by reporting it below.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">{error.name}</h3>
                <p className="text-red-700 text-sm">{error.message}</p>
                {error.digest && (
                  <p className="text-red-600 text-xs mt-2">Error ID: {error.digest}</p>
                )}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Stack Trace */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowStackTrace(!showStackTrace)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-700">Stack Trace</span>
              {showStackTrace ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showStackTrace && (
              <div className="p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-x-auto">
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
          </div>

          {/* User Report Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-700">Report this issue</label>
              <button
                onClick={captureScreenshot}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capture Screenshot
              </button>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
              <button
                onClick={() => insertFormatting('bold')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('italic')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('code')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Code"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertFormatting('list')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <textarea
              id="userReport"
              value={userReport}
              onChange={(e) => setUserReport(e.target.value)}
              placeholder="Please describe what you were doing when this error occurred..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={5}
            />

            {screenshot && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                ✓ Screenshot captured
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={downloadErrorReport}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
            <button
              onClick={createGithubIssue}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors"
            >
              <Github className="w-5 h-5" />
              Create Issue
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Your report helps us improve the application. All information is optional but appreciated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
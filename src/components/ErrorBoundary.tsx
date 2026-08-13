import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-white rounded-2xl shadow-xl border border-rose-100 text-slate-800 font-sans">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-xl font-bold">页面加载遇到异常 (Application Error)</h1>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            应用程序在运行时遇到了意外错误。错误详情如下：
          </p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-auto max-h-64 mb-6">
            <p className="text-rose-400 font-bold mb-1">{this.state.error?.toString()}</p>
            <pre className="text-slate-400">{this.state.errorInfo?.componentStack}</pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            重新加载页面 (Reload Page)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

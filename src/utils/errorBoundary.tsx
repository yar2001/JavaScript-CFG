import React from 'react';

export class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  { error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    // logErrorToMyService(error, info.componentStack);
    console.error(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="px-5 py-3 space-y-2">
          <div className="px-3 py-1 text-red-600 bg-red-100 rounded-md">
            <div className="font-bold">错误</div>
            <pre className="break-all whitespace-pre-wrap">{this.state.error.stack}</pre>
          </div>
          <button
            className="px-3 py-1 text-blue-600 bg-blue-100 rounded-md"
            onClick={() => {
              this.setState({ error: undefined });
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

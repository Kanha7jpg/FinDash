import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error boundary caught an error', error, info);
  }

  public render() {
    if (this.state.hasError) {
      return <h1 className="p-6 text-red-700">Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

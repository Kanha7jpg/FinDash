import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    state = {
        hasError: false
    };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error('Error boundary caught an error', error, info);
    }
    render() {
        if (this.state.hasError) {
            return _jsx("h1", { className: "p-6 text-red-700", children: "Something went wrong." });
        }
        return this.props.children;
    }
}

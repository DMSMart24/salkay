"use client";

import { Component, type ReactNode } from "react";

type KayErrorBoundaryProps = {
  fallback: ReactNode;
  children: ReactNode;
};

type KayErrorBoundaryState = {
  failed: boolean;
};

export class KayErrorBoundary extends Component<
  KayErrorBoundaryProps,
  KayErrorBoundaryState
> {
  state: KayErrorBoundaryState = {
    failed: false,
  };

  static getDerivedStateFromError(): KayErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[KAY] WebGL scene failed, using fallback.", error);
    }
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

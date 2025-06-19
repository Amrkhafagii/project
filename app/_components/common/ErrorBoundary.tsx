import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Layout } from '@/constants';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={64} color={Colors.error} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <RefreshCw size={20} color={Colors.white} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Layout.spacing.xl,
  },
  errorDetails: {
    backgroundColor: Colors.gray[100],
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.xl,
    width: '100%',
  },
  errorTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: Layout.spacing.sm,
  },
  errorText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.sm,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
});

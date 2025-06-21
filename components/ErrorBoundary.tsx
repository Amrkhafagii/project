import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { logger } from '@/utils/logger';
import { Colors, Layout } from '@/constants';
import { NetworkUtils } from '@/utils/network/networkUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  networkInfo: any;
}

/**
 * Error boundary component for graceful error handling
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      networkInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      networkInfo: null,
    };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Get network information for debugging
    const networkInfo = await NetworkUtils.getNetworkInfo();

    logger.error('Error boundary caught error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      networkInfo,
    });

    this.setState({
      error,
      errorInfo,
      networkInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      networkInfo: null,
    });
  };

  handleReport = () => {
    const { error, errorInfo, networkInfo } = this.state;
    
    const errorReport = {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : null,
      componentStack: errorInfo?.componentStack,
      networkInfo,
      timestamp: new Date().toISOString(),
    };

    logger.error('Error report', errorReport);
    
    Alert.alert(
      'Error Reported',
      'The error has been logged. Thank you for helping us improve the app.',
      [{ text: 'OK' }]
    );
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error, errorInfo, networkInfo } = this.state;

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We're sorry for the inconvenience. The error has been logged.
            </Text>

            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Debug Information</Text>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Error:</Text>
                  <Text style={styles.errorMessage}>
                    {error?.name}: {error?.message}
                  </Text>
                </View>

                {networkInfo && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Network Status:</Text>
                    <Text style={styles.debugText}>
                      Connected: {networkInfo.isConnected ? 'Yes' : 'No'}
                    </Text>
                    <Text style={styles.debugText}>
                      Type: {networkInfo.type}
                    </Text>
                  </View>
                )}

                {error?.stack && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Stack Trace:</Text>
                    <ScrollView style={styles.stackTrace}>
                      <Text style={styles.stackText}>{error.stack}</Text>
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleReset}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleReport}
              >
                <Text style={styles.secondaryButtonText}>Report Issue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  },
  content: {
    flexGrow: 1,
    padding: Layout.spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  subtitle: {
    fontSize: Layout.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  debugInfo: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  debugTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  section: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  errorMessage: {
    fontSize: Layout.fontSize.sm,
    color: Colors.error,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  stackTrace: {
    maxHeight: 200,
    backgroundColor: Colors.background,
    borderRadius: Layout.radius.sm,
    padding: Layout.spacing.sm,
  },
  stackText: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    gap: Layout.spacing.md,
  },
  button: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});

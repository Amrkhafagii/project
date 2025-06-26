import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { Play, Pause, RotateCcw, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function RestTimer() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Default 60 seconds
  const [selectedDuration, setSelectedDuration] = useState(60);

  const presetDurations = [30, 60, 90, 120, 180];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Could also play a sound here
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (duration: number) => {
    setSelectedDuration(duration);
    setTimeLeft(duration);
    setIsRunning(true);
    setIsVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeTimer = () => {
    setIsRunning(false);
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <View style={styles.quickTimerContainer}>
        <Text style={styles.quickTimerLabel}>Rest Timer</Text>
        <View style={styles.quickTimerButtons}>
          {presetDurations.map((duration) => (
            <TouchableOpacity
              key={duration}
              style={styles.quickTimerButton}
              onPress={() => startTimer(duration)}
            >
              <Text style={styles.quickTimerButtonText}>{duration}s</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rest Timer</Text>
        <TouchableOpacity onPress={closeTimer} style={styles.closeButton}>
          <X size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((selectedDuration - timeLeft) / selectedDuration) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetTimer}
        >
          <RotateCcw size={24} color="#6b7280" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playPauseButton]}
          onPress={toggleTimer}
        >
          {isRunning ? (
            <Pause size={32} color="#fff" />
          ) : (
            <Play size={32} color="#fff" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </View>

      <View style={styles.presets}>
        {presetDurations.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.presetButton,
              selectedDuration === duration && styles.presetButtonActive,
            ]}
            onPress={() => {
              setSelectedDuration(duration);
              setTimeLeft(duration);
              setIsRunning(false);
            }}
          >
            <Text
              style={[
                styles.presetButtonText,
                selectedDuration === duration && styles.presetButtonTextActive,
              ]}
            >
              {duration}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickTimerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quickTimerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quickTimerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickTimerButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickTimerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
  },
  playPauseButton: {
    backgroundColor: '#6366f1',
  },
  spacer: {
    width: 56,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  presetButtonActive: {
    backgroundColor: '#ede9fe',
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  presetButtonTextActive: {
    color: '#6366f1',
  },
});

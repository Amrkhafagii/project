import { create } from 'zustand';

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
  notes: string;
}

interface ActiveWorkout {
  id: string;
  startTime: Date;
  exercises: Exercise[];
  notes: string;
}

interface WorkoutStore {
  activeWorkout: ActiveWorkout | null;
  restTimerDuration: number;
  isRestTimerRunning: boolean;
  
  startWorkout: () => void;
  updateActiveWorkout: (workout: ActiveWorkout) => void;
  clearActiveWorkout: () => void;
  
  setRestTimerDuration: (duration: number) => void;
  startRestTimer: () => void;
  stopRestTimer: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  activeWorkout: null,
  restTimerDuration: 60,
  isRestTimerRunning: false,
  
  startWorkout: () => set({
    activeWorkout: {
      id: Date.now().toString(),
      startTime: new Date(),
      exercises: [],
      notes: '',
    },
  }),
  
  updateActiveWorkout: (workout) => set({ activeWorkout: workout }),
  
  clearActiveWorkout: () => set({ activeWorkout: null }),
  
  setRestTimerDuration: (duration) => set({ restTimerDuration: duration }),
  
  startRestTimer: () => set({ isRestTimerRunning: true }),
  
  stopRestTimer: () => set({ isRestTimerRunning: false }),
}));

import { calculateDistance } from '../location/locationService';

interface DeliveryPoint {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  priority: number; // 1-5, 5 being highest priority
  estimatedTime: number; // minutes at location
}

interface OptimizedRoute {
  totalDistance: number;
  totalTime: number;
  stops: DeliveryPoint[];
  estimatedArrivalTimes: string[];
}

export function optimizeDeliveryRoute(
  startPoint: DeliveryPoint,
  deliveryPoints: DeliveryPoint[]
): OptimizedRoute {
  if (deliveryPoints.length === 0) {
    return {
      totalDistance: 0,
      totalTime: 0,
      stops: [],
      estimatedArrivalTimes: [],
    };
  }

  if (deliveryPoints.length === 1) {
    const distance = calculateDistance(
      startPoint.latitude,
      startPoint.longitude,
      deliveryPoints[0].latitude,
      deliveryPoints[0].longitude
    );
    
    const travelTime = distance * 3; // 3 minutes per km average in city
    const arrivalTime = new Date();
    arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTime);
    
    return {
      totalDistance: distance,
      totalTime: travelTime + deliveryPoints[0].estimatedTime,
      stops: deliveryPoints,
      estimatedArrivalTimes: [arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })],
    };
  }

  // For multiple stops, use nearest neighbor with priority weighting
  const optimizedStops: DeliveryPoint[] = [];
  const remainingPoints = [...deliveryPoints];
  let currentPoint = startPoint;
  let totalDistance = 0;
  let totalTime = 0;
  const arrivalTimes: string[] = [];

  const currentTime = new Date();

  while (remainingPoints.length > 0) {
    let bestPoint: DeliveryPoint | null = null;
    let bestScore = Infinity;
    let bestIndex = -1;

    remainingPoints.forEach((point, index) => {
      const distance = calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        point.latitude,
        point.longitude
      );

      // Score combines distance and priority (lower score is better)
      // Higher priority orders get preference (priority 5 gets more weight than priority 1)
      const priorityWeight = (6 - point.priority) * 2; // Priority 5 = weight 2, Priority 1 = weight 10
      const score = distance + priorityWeight;

      if (score < bestScore) {
        bestScore = score;
        bestPoint = point;
        bestIndex = index;
      }
    });

    if (bestPoint) {
      const distance = calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        bestPoint.latitude,
        bestPoint.longitude
      );

      const travelTime = distance * 3; // 3 minutes per km
      totalDistance += distance;
      totalTime += travelTime + bestPoint.estimatedTime;

      currentTime.setMinutes(currentTime.getMinutes() + travelTime);
      arrivalTimes.push(currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      currentTime.setMinutes(currentTime.getMinutes() + bestPoint.estimatedTime);

      optimizedStops.push(bestPoint);
      remainingPoints.splice(bestIndex, 1);
      currentPoint = bestPoint;
    }
  }

  return {
    totalDistance,
    totalTime,
    stops: optimizedStops,
    estimatedArrivalTimes: arrivalTimes,
  };
}

export function calculateDeliveryBatching(
  orders: Array<{
    id: string;
    restaurantLocation: DeliveryPoint;
    customerLocation: DeliveryPoint;
    priority: number;
    readyTime: Date;
  }>,
  driverLocation: DeliveryPoint
): Array<{
  batchId: string;
  orders: typeof orders;
  route: OptimizedRoute;
  estimatedCompletionTime: Date;
}> {
  // Group orders by proximity and ready time
  const batches: Array<{
    batchId: string;
    orders: typeof orders;
    route: OptimizedRoute;
    estimatedCompletionTime: Date;
  }> = [];

  // Sort orders by ready time and priority
  const sortedOrders = [...orders].sort((a, b) => {
    const timeDiff = a.readyTime.getTime() - b.readyTime.getTime();
    if (Math.abs(timeDiff) < 15 * 60 * 1000) { // Within 15 minutes
      return b.priority - a.priority; // Higher priority first
    }
    return timeDiff;
  });

  const maxBatchSize = 4; // Maximum orders per batch
  const maxBatchRadius = 3; // Maximum 3km radius for batching

  while (sortedOrders.length > 0) {
    const batchOrders = [sortedOrders.shift()!];
    const batchCenter = batchOrders[0].customerLocation;

    // Try to add more orders to this batch
    let i = 0;
    while (i < sortedOrders.length && batchOrders.length < maxBatchSize) {
      const order = sortedOrders[i];
      const distanceFromCenter = calculateDistance(
        batchCenter.latitude,
        batchCenter.longitude,
        order.customerLocation.latitude,
        order.customerLocation.longitude
      );

      const timeDiff = Math.abs(order.readyTime.getTime() - batchOrders[0].readyTime.getTime());
      
      if (distanceFromCenter <= maxBatchRadius && timeDiff <= 20 * 60 * 1000) { // Within 20 minutes
        batchOrders.push(sortedOrders.splice(i, 1)[0]);
      } else {
        i++;
      }
    }

    // Create delivery points for this batch
    const deliveryPoints: DeliveryPoint[] = batchOrders.map(order => ({
      ...order.customerLocation,
      priority: order.priority,
      estimatedTime: 3, // 3 minutes per delivery
    }));

    // Optimize route for this batch
    const route = optimizeDeliveryRoute(driverLocation, deliveryPoints);
    
    // Calculate estimated completion time
    const completionTime = new Date();
    completionTime.setMinutes(completionTime.getMinutes() + route.totalTime);

    batches.push({
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orders: batchOrders,
      route,
      estimatedCompletionTime: completionTime,
    });
  }

  return batches;
}

export function calculateETAWithTraffic(
  distance: number,
  timeOfDay: Date = new Date()
): { eta: number; trafficFactor: number } {
  const hour = timeOfDay.getHours();
  let trafficFactor = 1.0;

  // Traffic factors based on time of day
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    // Rush hours - heavier traffic
    trafficFactor = 1.8;
  } else if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 20)) {
    // Lunch and dinner rush - moderate traffic
    trafficFactor = 1.4;
  } else if (hour >= 22 || hour <= 6) {
    // Late night/early morning - light traffic
    trafficFactor = 0.8;
  } else {
    // Normal traffic
    trafficFactor = 1.2;
  }

  // Weekend adjustments
  const dayOfWeek = timeOfDay.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
    trafficFactor *= 0.9; // Generally lighter traffic on weekends
  }

  // Base speed: 25 km/h in city traffic
  const baseSpeed = 25;
  const adjustedSpeed = baseSpeed / trafficFactor;
  const eta = (distance / adjustedSpeed) * 60; // Convert to minutes

  return {
    eta: Math.ceil(eta),
    trafficFactor,
  };
}

export function calculateDynamicDeliveryFee(
  distance: number,
  timeOfDay: Date = new Date(),
  weather: 'clear' | 'rain' | 'snow' | 'storm' = 'clear'
): number {
  const baseFee = 2.99;
  let distanceFee = Math.max(0, (distance - 2) * 1.50); // $1.50 per km after 2km
  
  // Time-based surge pricing
  const hour = timeOfDay.getHours();
  let surgeFactor = 1.0;
  
  if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21)) {
    // Peak meal times
    surgeFactor = 1.3;
  } else if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    // Rush hours
    surgeFactor = 1.2;
  }

  // Weather adjustments
  let weatherFactor = 1.0;
  switch (weather) {
    case 'rain':
      weatherFactor = 1.25;
      break;
    case 'snow':
      weatherFactor = 1.5;
      break;
    case 'storm':
      weatherFactor = 1.75;
      break;
  }

  // Weekend premium
  const dayOfWeek = timeOfDay.getDay();
  const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.1 : 1.0;

  const totalFee = (baseFee + distanceFee) * surgeFactor * weatherFactor * weekendFactor;
  
  return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
}

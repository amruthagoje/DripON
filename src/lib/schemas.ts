import { z } from 'zod';

export const transferSchema = z.object({
  gestureType: z.string().min(1, 'Gesture is required.'),
  destinationDeviceId: z.string().min(1, 'Destination device ID is required.'),
});

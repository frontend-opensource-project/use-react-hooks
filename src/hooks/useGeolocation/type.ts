export interface UseGeolocationReturnType
  extends Partial<GeolocationCoordinates> {
  loading: boolean;
  error: GeolocationPositionError | null;
  timestamp: EpochTimeStamp | undefined;
}

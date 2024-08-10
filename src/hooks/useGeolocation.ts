import { useEffect, useState, useRef } from 'react';

interface UseGeolocationReturnType extends Partial<GeolocationCoordinates> {
  loading: boolean;
  error: GeolocationPositionError | null;
  timestamp: EpochTimeStamp | undefined;
}

/**
 * 사용자의 위치 정보를 가져오는 커스텀 훅
 *
 * @param {PositionOptions} options - 위치 정보를 가져오는 옵션
 * @param {boolean} options.enableHighAccuracy - 위치 정보를 높은 정확도로 수집할지 여부를 지정 (기본값은 false)
 * @param {number} options.timeout - 위치 정보를 가져오기 위해 대기할 최대 시간 (밀리초 단위)
 * @param {number} options.maximumAge - 위치 정보를 캐싱할 최대 시간 (밀리초 단위)

* @returns {UseGeolocationReturnType} 위치 정보와 상태를 포함하는 객체를 반환
 * @returns {boolean} UseGeolocationReturnType.loading - 위치 정보를 가져오는 중인지 여부
 * @returns {GeolocationPositionError | null} UseGeolocationReturnType.error - 위치 정보를 가져오는 중에 발생한 에러
 * @returns {EpochTimeStamp | undefined} UseGeolocationReturnType.timestamp - 위치 정보의 타임스탬프
 * @returns {number | undefined} UseGeolocationReturnType.latitude - 위도 정보
 * @returns {number | undefined} UseGeolocationReturnType.longitude - 경도 정보
 * @returns {number | undefined} UseGeolocationReturnType.altitude - 고도 정보
 * @returns {number | undefined} UseGeolocationReturnType.accuracy - 위치 정보의 정확도
 * @returns {number | undefined} UseGeolocationReturnType.altitudeAccuracy - 고도 정보의 정확도
 * @returns {number | undefined} UseGeolocationReturnType.heading - 방향 정보
 * @returns {number | undefined} UseGeolocationReturnType.speed - 속도 정보
 */
const useGeolocation = (
  options: PositionOptions = {}
): UseGeolocationReturnType => {
  const isMounted = useRef(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  const { enableHighAccuracy, timeout, maximumAge } = options;

  useEffect(() => {
    const handleSuccess = (position: GeolocationPosition) => {
      if (isMounted.current) {
        setPosition(position);
        setLoading(false);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      if (isMounted.current) {
        setError(err);
        setLoading(false);
      }
    };

    const handleReset = () => {
      setLoading(true);
      setError(null);
      setPosition(null);
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    return () => {
      handleReset();
      isMounted.current = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enableHighAccuracy, timeout, maximumAge]);

  const {
    latitude,
    longitude,
    altitude,
    accuracy,
    altitudeAccuracy,
    heading,
    speed,
  } = position?.coords || {};

  const timestamp = position?.timestamp ?? undefined;

  return {
    latitude,
    longitude,
    altitude,
    accuracy,
    altitudeAccuracy,
    heading,
    speed,
    timestamp,
    error,
    loading,
  };
};

export default useGeolocation;

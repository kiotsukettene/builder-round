const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

export interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface WithDistance {
  distanceKm: number | null;
}

export function sortByDistanceFromPatient<T extends { firstName: string; lastName: string }>(
  items: T[],
  patientLat: number,
  patientLng: number,
  getCoords: (item: T) => Coordinates,
): (T & WithDistance)[] {
  const withDistance = items.map((item) => {
    const { latitude, longitude } = getCoords(item);
    const distanceKm =
      latitude !== null && longitude !== null
        ? haversineKm(patientLat, patientLng, latitude, longitude)
        : null;
    return { ...item, distanceKm };
  });

  return withDistance.sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) {
      return compareByName(a, b);
    }
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return compareByName(a, b);
  });
}

function compareByName(
  a: { firstName: string; lastName: string },
  b: { firstName: string; lastName: string },
): number {
  const last = a.lastName.localeCompare(b.lastName);
  if (last !== 0) return last;
  return a.firstName.localeCompare(b.firstName);
}

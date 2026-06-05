import { DeliverySlabs, DeliverySettings } from '../constants/index.js';

class DeliveryService {
  /**
   * Calculate delivery charge based on distance
   * @param {number} distanceInKm 
   * @returns {number} delivery charge
   */
  static calculateDeliveryCharge(distanceInKm) {
    if (distanceInKm > DeliverySettings.MAX_DELIVERY_RADIUS_KM) {
      throw new Error(`Delivery not available beyond ${DeliverySettings.MAX_DELIVERY_RADIUS_KM} km`);
    }

    let charge = 0;
    // Find the appropriate slab
    for (const slab of DeliverySlabs) {
      if (distanceInKm <= slab.maxKm) {
        charge = slab.charge;
        break;
      }
    }
    
    // If somehow distance doesn't fit in slabs but is less than max, fallback to max charge
    if (charge === 0 && distanceInKm <= DeliverySettings.MAX_DELIVERY_RADIUS_KM) {
      charge = DeliverySlabs[DeliverySlabs.length - 1].charge;
    }

    return charge;
  }

  // Uses Haversine formula to calculate distance between two coordinates
  static getDistance(lat1, lon1, lat2, lon2) {
    if ((lat1 === lat2) && (lon1 === lon2)) {
      return 0;
    }
    const radlat1 = Math.PI * lat1/180;
    const radlat2 = Math.PI * lat2/180;
    const theta = lon1-lon2;
    const radtheta = Math.PI * theta/180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515; // Miles
    dist = dist * 1.609344; // Kilometers
    return dist;
  }
}

export default DeliveryService;

export interface Coordinates {
  lat: number
  lon: number
}

export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Geolocation timeout'))
    }, 15000)
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          reject(new Error('Invalid coordinates'))
          return
        }
        
        resolve({ lat, lon })
      },
      (error) => {
        clearTimeout(timeoutId)
        reject(new Error(`Geolocation error: ${error.message}`))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

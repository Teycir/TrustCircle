import { describe, it, expect } from 'vitest'
import { checkLocationCondition } from '../lib/capsule'

describe('Location Locking Stress Tests', () => {
  const parisCoords = { latitude: 48.8566, longitude: 2.3522 }
  const londonCoords = { latitude: 51.5074, longitude: -0.1278 }
  const tokyoCoords = { latitude: 35.6762, longitude: 139.6503 }
  const newYorkCoords = { latitude: 40.7128, longitude: -74.0060 }

  describe('Distance Calculation Accuracy', () => {
    it('should correctly calculate distance within same city', () => {
      const policy = {
        location: { ...parisCoords, radius: 5000 }
      }
      const nearbyLocation = { latitude: 48.8606, longitude: 2.3376 }
      
      expect(() => checkLocationCondition(policy, nearbyLocation)).not.toThrow()
    })

    it('should reject location outside radius', () => {
      const policy = {
        location: { ...parisCoords, radius: 1000 }
      }
      
      expect(() => checkLocationCondition(policy, londonCoords)).toThrow('Location requirement not met')
    })

    it('should handle exact location match', () => {
      const policy = {
        location: { ...parisCoords, radius: 1 }
      }
      
      expect(() => checkLocationCondition(policy, parisCoords)).not.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero radius', () => {
      const policy = {
        location: { ...parisCoords, radius: 0 }
      }
      
      expect(() => checkLocationCondition(policy, parisCoords)).not.toThrow()
    })

    it('should handle very large radius', () => {
      const policy = {
        location: { ...parisCoords, radius: 20000000 }
      }
      
      expect(() => checkLocationCondition(policy, tokyoCoords)).not.toThrow()
    })

    it('should handle coordinates at poles', () => {
      const northPole = { latitude: 90, longitude: 0 }
      const policy = {
        location: { ...northPole, radius: 1000 }
      }
      
      expect(() => checkLocationCondition(policy, northPole)).not.toThrow()
    })

    it('should handle coordinates at equator', () => {
      const equator = { latitude: 0, longitude: 0 }
      const policy = {
        location: { ...equator, radius: 1000 }
      }
      
      expect(() => checkLocationCondition(policy, equator)).not.toThrow()
    })

    it('should handle international date line crossing', () => {
      const eastSide = { latitude: 0, longitude: 179.9 }
      const westSide = { latitude: 0, longitude: -179.9 }
      const policy = {
        location: { ...eastSide, radius: 50000 }
      }
      
      expect(() => checkLocationCondition(policy, westSide)).not.toThrow()
    })
  })

  describe('Precision Tests', () => {
    it('should handle very small distances accurately', () => {
      const policy = {
        location: { latitude: 48.8566, longitude: 2.3522, radius: 10 }
      }
      const veryClose = { latitude: 48.85661, longitude: 2.35221 }
      
      expect(() => checkLocationCondition(policy, veryClose)).not.toThrow()
    })

    it('should reject location just outside radius', () => {
      const policy = {
        location: { ...parisCoords, radius: 1000 }
      }
      const justOutside = { latitude: 48.8656, longitude: 2.3522 }
      
      expect(() => checkLocationCondition(policy, justOutside)).toThrow()
    })

    it('should handle floating point precision', () => {
      const policy = {
        location: { latitude: 48.856614, longitude: 2.352222, radius: 1 }
      }
      const sameLocation = { latitude: 48.856614, longitude: 2.352222 }
      
      expect(() => checkLocationCondition(policy, sameLocation)).not.toThrow()
    })
  })

  describe('Invalid Input Handling', () => {
    it('should handle missing location in policy', () => {
      const policy = {}
      
      expect(() => checkLocationCondition(policy, parisCoords)).not.toThrow()
    })

    it('should reject invalid latitude', () => {
      const policy = {
        location: { latitude: 91, longitude: 0, radius: 1000 }
      }
      
      expect(() => checkLocationCondition(policy, parisCoords)).toThrow()
    })

    it('should reject invalid longitude', () => {
      const policy = {
        location: { latitude: 0, longitude: 181, radius: 1000 }
      }
      
      expect(() => checkLocationCondition(policy, parisCoords)).toThrow()
    })

    it('should reject negative radius', () => {
      const policy = {
        location: { ...parisCoords, radius: -1000 }
      }
      
      expect(() => checkLocationCondition(policy, parisCoords)).toThrow()
    })
  })

  describe('Real World Scenarios', () => {
    it('should work for office building access', () => {
      const officeLocation = { latitude: 48.8738, longitude: 2.2950, radius: 100 }
      const policy = { location: officeLocation }
      const insideOffice = { latitude: 48.8739, longitude: 2.2951 }
      
      expect(() => checkLocationCondition(policy, insideOffice)).not.toThrow()
    })

    it('should work for city-wide access', () => {
      const policy = {
        location: { ...parisCoords, radius: 10000 }
      }
      const parisSuburb = { latitude: 48.9, longitude: 2.4 }
      
      expect(() => checkLocationCondition(policy, parisSuburb)).not.toThrow()
    })

    it('should work for event venue access', () => {
      const venueLocation = { latitude: 48.8584, longitude: 2.2945, radius: 500 }
      const policy = { location: venueLocation }
      const nearVenue = { latitude: 48.8590, longitude: 2.2950 }
      
      expect(() => checkLocationCondition(policy, nearVenue)).not.toThrow()
    })

    it('should reject access from different continent', () => {
      const policy = {
        location: { ...parisCoords, radius: 10000 }
      }
      
      expect(() => checkLocationCondition(policy, newYorkCoords)).toThrow()
    })
  })

  describe('Performance Tests', () => {
    it('should handle rapid consecutive checks', () => {
      const policy = {
        location: { ...parisCoords, radius: 5000 }
      }
      const nearbyLocation = { latitude: 48.86, longitude: 2.35 }
      
      const start = Date.now()
      for (let i = 0; i < 1000; i++) {
        checkLocationCondition(policy, nearbyLocation)
      }
      const duration = Date.now() - start
      
      expect(duration).toBeLessThan(1000)
    })

    it('should handle multiple different locations efficiently', () => {
      const locations = [
        parisCoords,
        londonCoords,
        tokyoCoords,
        newYorkCoords
      ]
      
      const start = Date.now()
      locations.forEach(loc => {
        const policy = { location: { ...loc, radius: 1000 } }
        checkLocationCondition(policy, loc)
      })
      const duration = Date.now() - start
      
      expect(duration).toBeLessThan(100)
    })
  })
})

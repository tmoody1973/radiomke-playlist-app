
import { TicketmasterEvent } from './cache.ts'

export const filterEventsByArtist = (events: TicketmasterEvent[], artistName: string): TicketmasterEvent[] => {
  const cleanArtistName = artistName.toLowerCase().trim()
  console.log(`🔍 Filtering ${events.length} events for artist: "${artistName}" (normalized: "${cleanArtistName}")`)
  
  const matchedEvents = events.filter(event => {
    const eventName = event.name.toLowerCase()
    const attractions = event._embedded?.attractions || []
    
    // Check attractions for exact or very close matches
    const matchesAttraction = attractions.some(attraction => {
      const attractionName = attraction.name.toLowerCase()
      
      // Exact match (highest priority)
      if (attractionName === cleanArtistName) {
        return true
      }
      
      // Handle variations like "NxWorries" vs "NXworries" - normalize special characters
      const normalizeArtistName = (name: string) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // Remove special characters
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim()
      }
      
      const normalizedCleanName = normalizeArtistName(cleanArtistName)
      const normalizedAttractionName = normalizeArtistName(attractionName)
      
      if (normalizedAttractionName === normalizedCleanName) {
        console.log(`✅ Normalized match: "${attractionName}" matches "${cleanArtistName}"`)
        return true
      }
      
      // Allow for minor variations like "Artist" vs "Artist Band" but be strict
      const words = cleanArtistName.split(' ')
      const attractionWords = attractionName.split(' ')
      
      // If searching for a single word, require exact match or the artist name to be the first word
      if (words.length === 1) {
        return attractionWords[0] === cleanArtistName || normalizeArtistName(attractionWords[0]) === normalizedCleanName
      }
      
      // For multi-word artist names, require all words to match in order
      if (words.length > 1) {
        return attractionName.startsWith(cleanArtistName) || 
               cleanArtistName.startsWith(attractionName) ||
               normalizedAttractionName.startsWith(normalizedCleanName) ||
               normalizedCleanName.startsWith(normalizedAttractionName)
      }
      
      return false
    })
    
    if (matchesAttraction) {
      console.log(`✅ Matched via attraction: ${event.name}`)
      return true
    }
    
    // Check event title for exact artist matches (be more restrictive)
    const words = cleanArtistName.split(' ')
    
    // For single word artists like "Omar", be very strict
    if (words.length === 1) {
      const exactMatches = [
        eventName === cleanArtistName,
        eventName.startsWith(cleanArtistName + ' '),
        eventName.startsWith(cleanArtistName + ':'),
        eventName.startsWith(cleanArtistName + ' -'),
        eventName.startsWith(cleanArtistName + ' |'),
        eventName.endsWith(' ' + cleanArtistName),
        eventName.includes('(' + cleanArtistName + ')'),
        // Allow for "Artist Live" or "Artist Concert" but not "Artist Name"
        /^omar\s+(live|concert|tour|show)(\s|$)/i.test(eventName) && cleanArtistName === 'omar'
      ]
      
      const isMatch = exactMatches.some(match => match)
      if (isMatch) {
        console.log(`✅ Matched via title (single word): ${event.name}`)
      }
      return isMatch
    }
    
    // For multi-word artists, allow more flexibility
    const artistInTitle = (
      eventName.startsWith(cleanArtistName + ' ') ||
      eventName.startsWith(cleanArtistName + ':') ||
      eventName.startsWith(cleanArtistName + ' -') ||
      eventName.includes(' ' + cleanArtistName + ' ') ||
      eventName.includes(' ' + cleanArtistName + ':') ||
      eventName.includes(' ' + cleanArtistName + ' -') ||
      eventName.includes('(' + cleanArtistName + ')') ||
      eventName.endsWith(' ' + cleanArtistName) ||
      eventName === cleanArtistName
    )
    
    if (artistInTitle) {
      console.log(`✅ Matched via title (multi-word): ${event.name}`)
    }
    
    return artistInTitle
  })

  console.log(`🎯 Found ${matchedEvents.length} matching events for "${artistName}"`)
  matchedEvents.forEach(event => {
    console.log(`  ✅ ${event.name} (${event.dates.start.localDate})`)
  })

  return matchedEvents
}

export const filterEventsForCaching = (events: TicketmasterEvent[], artistName: string): TicketmasterEvent[] => {
  // Use the same filtering logic as display to ensure consistency
  // This prevents events from being excluded from cache but shown to users
  const filtered = filterEventsByArtist(events, artistName)
  
  console.log(`🗄️ Caching ${filtered.length} events for ${artistName} (using same filter as display)`)
  filtered.forEach(event => {
    console.log(`🗄️ Will cache: ${event.name}`)
  })
  
  return filtered
}

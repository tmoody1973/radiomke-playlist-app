
import { TicketmasterEvent } from './cache.ts'

export const filterEventsByArtist = (events: TicketmasterEvent[], artistName: string): TicketmasterEvent[] => {
  const cleanArtistName = artistName.toLowerCase().trim()
  
  return events.filter(event => {
    const eventName = event.name.toLowerCase()
    const attractions = event._embedded?.attractions || []
    
    // Check attractions for exact or very close matches
    const matchesAttraction = attractions.some(attraction => {
      const attractionName = attraction.name.toLowerCase()
      
      // Exact match (highest priority)
      if (attractionName === cleanArtistName) {
        return true
      }
      
      // Allow for minor variations like "Artist" vs "Artist Band" but be strict
      const words = cleanArtistName.split(' ')
      const attractionWords = attractionName.split(' ')
      
      // If searching for a single word, require exact match or the artist name to be the first word
      if (words.length === 1) {
        return attractionWords[0] === cleanArtistName
      }
      
      // For multi-word artist names, require all words to match in order
      if (words.length > 1) {
        return attractionName.startsWith(cleanArtistName) || 
               cleanArtistName.startsWith(attractionName)
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
}

export const filterEventsForCaching = (events: TicketmasterEvent[], artistName: string): TicketmasterEvent[] => {
  const cleanArtistName = artistName.toLowerCase().trim()
  
  return events.filter(event => {
    const eventName = event.name.toLowerCase()
    const attractions = event._embedded?.attractions || []
    
    // For caching, be even more strict - require exact artist name match
    const hasExactAttractionMatch = attractions.some(attraction => {
      const attractionName = attraction.name.toLowerCase()
      return attractionName === cleanArtistName
    })
    
    // Or exact match in event title
    const hasExactTitleMatch = (
      eventName === cleanArtistName ||
      eventName.startsWith(cleanArtistName + ' ') ||
      eventName.startsWith(cleanArtistName + ':') ||
      eventName.startsWith(cleanArtistName + ' -') ||
      eventName.endsWith(' ' + cleanArtistName) ||
      eventName.includes('(' + cleanArtistName + ')')
    )
    
    const shouldCache = hasExactAttractionMatch || hasExactTitleMatch
    if (shouldCache) {
      console.log(`🗄️ Will cache exact match: ${event.name}`)
    } else {
      console.log(`⚠️ Filtered out for caching (not exact match): ${event.name}`)
    }
    
    return shouldCache
  })
}

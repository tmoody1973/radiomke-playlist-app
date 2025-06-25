
export const buildTicketmasterUrl = (artistName: string, apiKey: string): string => {
  const searchUrl = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  searchUrl.searchParams.set('keyword', artistName.trim())
  searchUrl.searchParams.set('city', 'Chicago,Milwaukee,Madison')
  searchUrl.searchParams.set('classificationName', 'music')
  searchUrl.searchParams.set('sort', 'date,asc')
  searchUrl.searchParams.set('apikey', apiKey)
  searchUrl.searchParams.set('size', '20')
  
  return searchUrl.toString()
}

export const fetchTicketmasterEvents = async (artistName: string, apiKey: string) => {
  const url = buildTicketmasterUrl(artistName, apiKey)
  
  console.log(`Making fresh API call to Ticketmaster for artist: ${artistName}`)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    console.error(`Ticketmaster API error: ${response.status} ${response.statusText}`)
    throw new Error(`Ticketmaster API error: ${response.status}`)
  }

  const data = await response.json()
  return data._embedded?.events || []
}

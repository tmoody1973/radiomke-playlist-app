// Check if a channel is likely an official music channel
export function isOfficialMusicChannel(channelTitle: string): boolean {
  const channel = channelTitle.toLowerCase();
  return channel.includes('vevo') || 
         channel.includes('records') || 
         channel.includes('music') ||
         channel.includes('official') ||
         channel.endsWith(' - topic') ||
         channel.includes('label');
}
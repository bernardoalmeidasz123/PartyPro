
export const generateInviteCode = (businessName: string): string => {
  const prefixes = ['PRO', 'ELITE', 'VIP', 'DECOR', 'ATELIER'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Retorna um código no formato ATELIER-2026-X4A2
  return `${prefix}-${year}-${random}`;
};

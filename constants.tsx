
import React from 'react';

export const CATEGORIES = ['Mobilário', 'Flores', 'Iluminação', 'Painéis', 'Doces', 'Outros'] as const;

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const YEARS = Array.from({ length: 15 }, (_, i) => 2026 + i); // 2026 to 2040

export const STATUS_COLORS = {
  Pendente: 'bg-yellow-100 text-yellow-800',
  Confirmado: 'bg-green-100 text-green-800',
  Finalizado: 'bg-blue-100 text-blue-800',
  Cancelado: 'bg-red-100 text-red-800',
};

import React from 'react';

export const CATEGORIES = ['Mobilário', 'Flores', 'Iluminação', 'Painéis', 'Doces', 'Outros'] as const;

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const YEARS = [2026, 2027, 2028, 2029, 2030];

export const STATUS_COLORS = {
  Pendente: 'bg-yellow-100 text-yellow-800',
  Confirmado: 'bg-emerald-100 text-emerald-800',
  Finalizado: 'bg-blue-100 text-blue-800',
  Cancelado: 'bg-red-100 text-red-800',
};
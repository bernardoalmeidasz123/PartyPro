import React, { useState } from 'react';
import { EventParty } from '../types';
import { MONTHS, YEARS } from '../constants';

interface CalendarViewProps {
  events: EventParty[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  // Inicializa em Janeiro de 2026 conforme solicitado
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      if (currentYear > 2026) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(11);
      }
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      if (currentYear < 2030) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(0);
      }
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDay = (day: number) => {
    return events.filter(ev => {
      const d = new Date(ev.date);
      // Usar UTC para consistência em servidores de deploy
      return d.getUTCFullYear() === currentYear && d.getUTCMonth() === currentMonth && d.getUTCDate() === day;
    });
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    // Espaços vazios no início do mês
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/10 border border-slate-100/30"></div>);
    }

    // Dias do mês
    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d);
      days.push(
        <div key={d} className="h-24 md:h-32 bg-white border border-slate-100 p-2 overflow-y-auto hover:bg-emerald-50/20 transition-colors">
          <span className="text-[10px] font-bold text-slate-300">{d}</span>
          <div className="mt-1 space-y-1">
            {dayEvents.map(ev => (
              <div key={ev.id} className={`text-[8px] md:text-[9px] p-1 rounded border leading-tight font-bold truncate ${
                ev.status === 'Confirmado' ? 'bg-emerald-950 text-champagne border-emerald-900' : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display text-emerald-950">Agenda Elite 2026-2030</h2>
          <p className="text-slate-500 text-sm">Visualize o cronograma de festas do seu Atelier.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-bold text-emerald-900 cursor-pointer text-xs uppercase tracking-widest"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-bold text-emerald-900 cursor-pointer text-xs uppercase tracking-widest"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>
      </header>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/30">
          <button 
            onClick={handlePrevMonth} 
            disabled={currentYear === 2026 && currentMonth === 0}
            className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 text-emerald-950 font-bold disabled:opacity-10"
          >
            ←
          </button>
          <h3 className="text-2xl font-display font-bold text-emerald-950">
            {MONTHS[currentMonth]} <span className="text-champagne font-normal italic">{currentYear}</span>
          </h3>
          <button 
            onClick={handleNextMonth} 
            disabled={currentYear === 2030 && currentMonth === 11}
            className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 text-emerald-950 font-bold disabled:opacity-10"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-emerald-950">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
            <div key={d} className="py-4 text-[9px] font-black text-emerald-500 tracking-[0.2em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderDays()}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 p-6 bg-white rounded-3xl border border-slate-100">
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-emerald-950 rounded-full border border-champagne"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirmado</span>
         </div>
         <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-slate-100 rounded-full border border-slate-200"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendente</span>
         </div>
      </div>
    </div>
  );
};

export default CalendarView;
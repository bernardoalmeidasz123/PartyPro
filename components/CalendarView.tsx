import React, { useState } from 'react';
import { EventParty } from '../types';
import { MONTHS, YEARS } from '../constants';

interface CalendarViewProps {
  events: EventParty[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
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
      // Usamos getUTC para evitar desvios de fuso horário no servidor de deploy
      return d.getUTCFullYear() === currentYear && d.getUTCMonth() === currentMonth && d.getUTCDate() === day;
    });
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/20 border border-slate-100/50"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d);
      days.push(
        <div key={d} className="h-24 md:h-32 bg-white border border-slate-100 p-2 overflow-y-auto hover:bg-emerald-50/30 transition-colors group">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-emerald-300">{d}</span>
            {dayEvents.length > 0 && <span className="w-1.5 h-1.5 bg-champagne rounded-full"></span>}
          </div>
          <div className="space-y-1">
            {dayEvents.map(ev => (
              <div key={ev.id} className={`text-[8px] p-1 rounded border leading-tight font-bold truncate ${ev.status === 'Confirmado' ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display text-emerald-950">Agenda Pro</h2>
          <p className="text-slate-500 text-sm">Controle de datas Atelier 2026 — 2030.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-bold text-emerald-900 cursor-pointer text-sm"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-bold text-emerald-900 cursor-pointer text-sm"
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
            className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200 text-emerald-950 font-bold disabled:opacity-20"
          >
            ←
          </button>
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold text-emerald-950">
              {MONTHS[currentMonth]}
            </h3>
            <p className="text-champagne font-bold tracking-[0.3em] text-[10px] uppercase">{currentYear}</p>
          </div>
          <button 
            onClick={handleNextMonth} 
            disabled={currentYear === 2030 && currentMonth === 11}
            className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200 text-emerald-950 font-bold disabled:opacity-20"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-emerald-950">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
            <div key={d} className="py-4 text-[10px] font-black text-emerald-500 tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderDays()}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-6 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
           <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pendente</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
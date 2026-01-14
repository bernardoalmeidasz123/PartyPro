
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
      // Usamos a data local para coincidir com a entrada do usuário
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && (d.getDate() + 1) === day;
    });
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    // Espaços vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-40 bg-slate-50/20 border border-slate-50/50"></div>);
    }

    // Dias do mês
    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d);
      const isToday = new Date().getDate() === d && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

      days.push(
        <div key={d} className={`h-24 md:h-40 bg-white border border-slate-100 p-3 overflow-y-auto transition-all group hover:z-10 hover:shadow-2xl hover:scale-[1.02] ${isToday ? 'ring-1 ring-inset ring-champagne/30 bg-champagne/5' : ''}`}>
          <div className="flex justify-between items-start">
             <span className={`text-[11px] font-black ${isToday ? 'text-champagne' : 'text-slate-300'} group-hover:text-emerald-950`}>{d}</span>
             {dayEvents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
          </div>
          <div className="mt-2 space-y-1.5">
            {dayEvents.map(ev => (
              <div key={ev.id} className={`text-[8px] md:text-[10px] p-2 rounded-xl border leading-tight font-bold transition-all hover:bg-white ${
                ev.status === 'Confirmado' 
                  ? 'bg-emerald-950 text-champagne border-emerald-900 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-slate-200'
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-block px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
             <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Cronograma 2026-2030</span>
          </div>
          <h2 className="text-4xl font-display text-emerald-950 font-bold">Agenda do Atelier</h2>
        </div>

        <div className="flex bg-white p-2 rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-black text-emerald-900 cursor-pointer text-[10px] uppercase tracking-[0.2em] px-6"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="h-6 w-px bg-slate-100 mx-2 self-center"></div>
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-black text-emerald-900 cursor-pointer text-[10px] uppercase tracking-[0.2em] px-6"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>
      </header>

      <div className="bg-white rounded-[60px] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-10 border-b border-slate-50 bg-slate-50/30">
          <button 
            onClick={handlePrevMonth} 
            disabled={currentYear === 2026 && currentMonth === 0}
            className="w-14 h-14 flex items-center justify-center bg-white text-emerald-950 rounded-full border border-slate-100 shadow-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-5 text-xl"
          >
            ←
          </button>
          <h3 className="text-3xl font-display font-bold text-emerald-950 text-center">
            {MONTHS[currentMonth]} <span className="text-champagne italic font-normal">{currentYear}</span>
          </h3>
          <button 
            onClick={handleNextMonth} 
            disabled={currentYear === 2030 && currentMonth === 11}
            className="w-14 h-14 flex items-center justify-center bg-white text-emerald-950 rounded-full border border-slate-100 shadow-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all disabled:opacity-5 text-xl"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-emerald-950">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
            <div key={d} className="py-5 text-[10px] font-black text-emerald-500 tracking-[0.3em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderDays()}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-8 p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
         <div className="flex items-center gap-3">
           <div className="w-4 h-4 bg-emerald-950 rounded-full border-2 border-champagne"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Festa Confirmada</span>
         </div>
         <div className="flex items-center gap-3">
           <div className="w-4 h-4 bg-slate-100 rounded-full border-2 border-slate-200"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento em Análise</span>
         </div>
         <div className="flex items-center gap-3">
           <div className="w-4 h-4 bg-champagne/20 rounded-full border-2 border-champagne/40"></div>
           <span className="text-[10px] font-black text-champagne uppercase tracking-widest">Dia Atual</span>
         </div>
      </div>
    </div>
  );
};

export default CalendarView;

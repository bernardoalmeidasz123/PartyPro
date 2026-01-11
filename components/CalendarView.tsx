import React, { useState } from 'react';
import { EventParty } from '../types';
import { MONTHS, YEARS } from '../constants';

interface CalendarViewProps {
  events: EventParty[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

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
      // UTC para evitar bugs de fuso horário em produção
      return d.getUTCFullYear() === currentYear && d.getUTCMonth() === currentMonth && d.getUTCDate() === day;
    });
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/30 border border-slate-100"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d);
      days.push(
        <div key={d} className="h-24 md:h-32 bg-white border border-slate-100 p-2 overflow-y-auto hover:bg-emerald-50/30 transition-colors">
          <span className="text-xs font-bold text-slate-300">{d}</span>
          <div className="mt-1 space-y-1">
            {dayEvents.map(ev => (
              <div key={ev.id} className="group relative">
                <div className={`text-[9px] p-1.5 rounded border ${ev.externalLink ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'} font-bold truncate`}>
                  {ev.title}
                </div>
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
          <h2 className="text-3xl font-display text-emerald-950">Programação Pro</h2>
          <p className="text-slate-500 text-sm">Calendário de festas ativo: 2026 - 2030.</p>
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

      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 text-emerald-950 font-bold">
            ←
          </button>
          <h3 className="text-xl font-display font-bold text-emerald-950">
            {MONTHS[currentMonth]} <span className="text-champagne">{currentYear}</span>
          </h3>
          <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 text-emerald-950 font-bold">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-emerald-950">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
            <div key={d} className="py-3 text-[10px] font-black text-emerald-500 tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderDays()}
        </div>
      </div>
      
      <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
        <p className="text-[11px] text-emerald-700 font-bold uppercase tracking-widest">Painel de Gerenciamento Manual Bernardo Almeida</p>
      </div>
    </div>
  );
};

export default CalendarView;
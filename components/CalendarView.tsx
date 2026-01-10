
import React, { useState } from 'react';
import { EventParty } from '../types';
import { MONTHS, YEARS } from '../constants';

interface CalendarViewProps {
  events: EventParty[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0); // Jan

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
      if (currentYear < 2040) {
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
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    // Empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-gray-50/50 border border-gray-100"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d);
      days.push(
        <div key={d} className="h-24 md:h-32 bg-white border border-gray-100 p-2 overflow-y-auto hover:bg-amber-50/20 transition-colors">
          <span className="text-sm font-semibold text-slate-500">{d}</span>
          <div className="mt-1 space-y-1">
            {dayEvents.map(ev => (
              <div key={ev.id} className="text-[10px] md:text-xs p-1 bg-amber-100 text-amber-800 rounded truncate border border-amber-200" title={ev.title}>
                {ev.time} {ev.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display text-slate-800">Agenda de Festas</h2>
          <p className="text-slate-500">Planeje sua agenda até 2040.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <select 
            value={currentYear} 
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-semibold text-slate-700 cursor-pointer"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          <select 
            value={currentMonth} 
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="bg-transparent border-none focus:ring-0 font-semibold text-slate-700 cursor-pointer"
          >
            {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            ←
          </button>
          <h3 className="text-xl font-bold text-slate-800">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            →
          </button>
        </div>

        <div className="grid grid-cols-7 text-center border-b border-gray-100 bg-slate-50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

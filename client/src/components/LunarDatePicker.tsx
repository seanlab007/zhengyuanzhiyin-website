import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 时辰数据
const SHICHEN = [
  { label: '子时 (23:00-00:59)', value: '子时' },
  { label: '丑时 (01:00-02:59)', value: '丑时' },
  { label: '寅时 (03:00-04:59)', value: '寅时' },
  { label: '卯时 (05:00-06:59)', value: '卯时' },
  { label: '辰时 (07:00-08:59)', value: '辰时' },
  { label: '巳时 (09:00-10:59)', value: '巳时' },
  { label: '午时 (11:00-12:59)', value: '午时' },
  { label: '未时 (13:00-14:59)', value: '未时' },
  { label: '申时 (15:00-16:59)', value: '申时' },
  { label: '酉时 (17:00-18:59)', value: '酉时' },
  { label: '戌时 (19:00-20:59)', value: '戌时' },
  { label: '亥时 (21:00-22:59)', value: '亥时' },
];

// 农历月份
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 农历日期
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

// 公历月份天数
function getSolarDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface DatePickerProps {
  onConfirm: (data: {
    calendarType: 'solar' | 'lunar';
    year: number;
    month: number;
    day: number;
    hour: string;
    displayStr: string;
  }) => void;
  onCancel: () => void;
  visible: boolean;
}

export default function LunarDatePicker({ onConfirm, onCancel, visible }: DatePickerProps) {
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const currentYear = new Date().getFullYear();

  // Generate year range
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= 1940; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedHour, setSelectedHour] = useState('子时');

  // Compute available days
  const maxDays = useMemo(() => {
    if (calendarType === 'solar') {
      return getSolarDaysInMonth(selectedYear, selectedMonth);
    }
    return 30; // Lunar months have at most 30 days
  }, [calendarType, selectedYear, selectedMonth]);

  useEffect(() => {
    if (selectedDay > maxDays) setSelectedDay(maxDays);
  }, [maxDays, selectedDay]);

  const handleConfirm = useCallback(() => {
    let displayStr = '';
    if (calendarType === 'solar') {
      displayStr = `公历 ${selectedYear}年${selectedMonth}月${selectedDay}日 ${selectedHour}`;
    } else {
      const monthStr = LUNAR_MONTHS[selectedMonth - 1] || '';
      const dayStr = LUNAR_DAYS[selectedDay - 1] || '';
      displayStr = `农历 ${selectedYear}年${monthStr}${dayStr} ${selectedHour}`;
    }
    onConfirm({
      calendarType,
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
      hour: selectedHour,
      displayStr,
    });
  }, [calendarType, selectedYear, selectedMonth, selectedDay, selectedHour, onConfirm]);

  if (!visible) return null;

  // Display string for preview
  const previewStr = calendarType === 'solar'
    ? `公历:${selectedYear}年${selectedMonth}月${selectedDay}日 ${selectedHour}`
    : `农历:${selectedYear}年${LUNAR_MONTHS[selectedMonth - 1] || ''}${LUNAR_DAYS[selectedDay - 1] || ''} ${selectedHour}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Preview bar */}
        <div className="bg-gray-50 px-4 py-3 text-center border-b">
          <p className="text-gray-800 font-medium text-sm">{previewStr}</p>
        </div>

        {/* Calendar type toggle */}
        <div className="flex mx-4 mt-3 rounded-xl overflow-hidden border border-gray-200">
          <button
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              calendarType === 'solar'
                ? 'bg-white text-red-600 border-r border-gray-200'
                : 'bg-gray-50 text-gray-500 border-r border-gray-200'
            }`}
            onClick={() => setCalendarType('solar')}
          >
            公历
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              calendarType === 'lunar'
                ? 'bg-red-500 text-white'
                : 'bg-gray-50 text-gray-500'
            }`}
            onClick={() => setCalendarType('lunar')}
          >
            农历
          </button>
        </div>

        {/* Picker columns */}
        <div className="flex px-2 py-4 gap-1">
          {/* Year */}
          <div className="flex-1 h-48 overflow-y-auto scrollbar-thin">
            {years.map(y => (
              <div
                key={y}
                className={`py-2 text-center text-sm cursor-pointer rounded-lg transition-colors ${
                  y === selectedYear ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedYear(y)}
              >
                {y}
              </div>
            ))}
          </div>

          {/* Month */}
          <div className="flex-1 h-48 overflow-y-auto scrollbar-thin">
            {(calendarType === 'lunar' ? LUNAR_MONTHS : Array.from({ length: 12 }, (_, i) => `${i + 1}月`)).map((m, i) => (
              <div
                key={i}
                className={`py-2 text-center text-sm cursor-pointer rounded-lg transition-colors ${
                  i + 1 === selectedMonth ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedMonth(i + 1)}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Day */}
          <div className="flex-1 h-48 overflow-y-auto scrollbar-thin">
            {(calendarType === 'lunar'
              ? LUNAR_DAYS.slice(0, maxDays)
              : Array.from({ length: maxDays }, (_, i) => `${i + 1}日`)
            ).map((d, i) => (
              <div
                key={i}
                className={`py-2 text-center text-sm cursor-pointer rounded-lg transition-colors ${
                  i + 1 === selectedDay ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDay(i + 1)}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Hour/Shichen */}
          <div className="flex-[1.3] h-48 overflow-y-auto scrollbar-thin">
            {SHICHEN.map(h => (
              <div
                key={h.value}
                className={`py-2 text-center text-xs cursor-pointer rounded-lg transition-colors ${
                  h.value === selectedHour ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedHour(h.value)}
              >
                {h.label}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex border-t">
          <button
            className="flex-1 py-4 text-gray-500 font-medium text-base border-r"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="flex-1 py-4 text-red-500 font-bold text-base"
            onClick={handleConfirm}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

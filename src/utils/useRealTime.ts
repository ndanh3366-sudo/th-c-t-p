import { useState, useEffect } from 'react';

export interface RealTimeInfo {
  now: Date;
  timeString: string;
  dateString: string;
  fullString: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useRealTime(): RealTimeInfo {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = dayNames[now.getDay()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const monthNum = String(now.getMonth() + 1).padStart(2, '0');
  const yearNum = now.getFullYear();
  const dateString = `${dayName}, ${dateNum}/${monthNum}/${yearNum}`;

  return {
    now,
    timeString,
    dateString,
    fullString: `${dateString} • ${timeString}`,
    hours,
    minutes,
    seconds
  };
}

/**
 * Calculates remaining HH:MM:SS from current real time to a target hour on the current day
 */
export function getRemainingToSlot(targetHour: number, targetMinute: number = 0): { hours: string; minutes: string; seconds: string; isPast: boolean } {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);

  let diff = Math.floor((target.getTime() - now.getTime()) / 1000);
  let isPast = false;

  if (diff <= 0) {
    // If target hour has passed today, target the same hour tomorrow
    target.setDate(target.getDate() + 1);
    diff = Math.floor((target.getTime() - now.getTime()) / 1000);
    isPast = true;
  }

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
    isPast
  };
}

/**
 * Calculates countdown from now until the end of the current active Flash Sale slot
 */
export function getActiveFlashSaleCountdown(): { currentSlot: string; nextSlot: string; countdownString: string; hours: string; minutes: string; seconds: string } {
  const now = new Date();
  const currentHour = now.getHours();

  // Slots: 00:00 (ends at 09:00), 09:00 (ends at 12:00), 12:00 (ends at 15:00), 15:00 (ends at 18:00), 18:00 (ends at 21:00), 21:00 (ends at 24:00/00:00)
  let currentSlot = '00:00';
  let nextSlot = '09:00';
  let targetHour = 9;

  if (currentHour >= 0 && currentHour < 9) {
    currentSlot = '00:00';
    nextSlot = '09:00';
    targetHour = 9;
  } else if (currentHour >= 9 && currentHour < 12) {
    currentSlot = '09:00';
    nextSlot = '12:00';
    targetHour = 12;
  } else if (currentHour >= 12 && currentHour < 15) {
    currentSlot = '12:00';
    nextSlot = '15:00';
    targetHour = 15;
  } else if (currentHour >= 15 && currentHour < 18) {
    currentSlot = '15:00';
    nextSlot = '18:00';
    targetHour = 18;
  } else if (currentHour >= 18 && currentHour < 21) {
    currentSlot = '18:00';
    nextSlot = '21:00';
    targetHour = 21;
  } else {
    currentSlot = '21:00';
    nextSlot = '00:00';
    targetHour = 24; // Midnight
  }

  const target = new Date(now);
  if (targetHour === 24) {
    target.setHours(23, 59, 59, 999);
  } else {
    target.setHours(targetHour, 0, 0, 0);
  }

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const diffSec = Math.floor(diffMs / 1000);

  const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
  const s = String(diffSec % 60).padStart(2, '0');

  return {
    currentSlot,
    nextSlot,
    countdownString: `${h} : ${m} : ${s}`,
    hours: h,
    minutes: m,
    seconds: s
  };
}

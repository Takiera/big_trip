import dayjs from 'dayjs';

/** Возвращает слово с заглавной буквы */
export const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

/** Возвращает случайный элемент массива */
export const getRandomArrayElement = (items) => items[Math.floor(Math.random() * items.length)];

export const getDate = (date, format) => dayjs(date).format(format);

export const getDateDuration = (dateFrom, dateTo) => {
  const minutes = dayjs(dateTo).startOf('minute').diff(dayjs(dateFrom).startOf('minute'), 'minute');

  if (!Number.isFinite(minutes) || minutes < 0) {
    return '';
  }

  const days = Math.floor(minutes / (24 * 60));
  const hours = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
  const remainingMinutes = String(minutes % 60).padStart(2, '0');

  return `${days > 0 ? `${days}D ` : ''}${hours}H ${remainingMinutes}M`;
};

export const sortByDay = (point1, point2) => dayjs(point1.dateFrom).diff(dayjs(point2.dateFrom));

export const sortByTime = (point1, point2) => dayjs(point2.dateTo).diff(point2.dateFrom) - dayjs(point1.dateTo).diff(point1.dateFrom);

export const sortByPrice = (point1, point2) => point2.basePrice - point1.basePrice;

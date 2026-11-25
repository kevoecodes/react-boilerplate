import dayjs from 'dayjs';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const number = new Intl.NumberFormat('en-US');

export const formatMoney = (value) => currency.format(Number(value ?? 0));
export const formatNumber = (value) => number.format(Number(value ?? 0));
export const formatDate = (value, pattern = 'YYYY-MM-DD HH:mm') =>
  value ? dayjs(value).format(pattern) : '—';

/** Capitalise the first letter: "pending" -> "Pending". */
export const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: es });
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy HH:mm', { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'HH:mm:ss', { locale: es });
  } catch {
    return dateStr;
  }
}

export function formatPhone(phone) {
  if (!phone) return '—';
  return phone.replace('whatsapp:', '');
}

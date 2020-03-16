import { format } from 'date-fns';

export const converDollarsToCents = price => (price * 100).toFixed(0);

export const converCentsToDollars = price => (price / 100).toFixed(2);

export const formatProductDate = date => format(new Date(date), 'MMM do, yyyy')

export const formatOrderDate = date => format(new Date(date), 'EEEE h:mm aaaa, MMM do, yyyy')
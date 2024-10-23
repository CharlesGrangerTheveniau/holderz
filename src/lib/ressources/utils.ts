import { parseISO, startOfDay } from "date-fns"

export const today = () => startOfDay(new Date())
export const isoParse = (v: string): Date => parseISO(v.split('T')[0] + 'T00:00:00.000')

export const asDate = (v: string | Date): Date => {
    return typeof v === 'string' ? isoParse(v) : v
}
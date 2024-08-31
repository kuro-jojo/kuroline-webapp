import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getDate'
})
export class GetDatePipe implements PipeTransform {

    private static readonly MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

    /**
     * Transforms a Date object into a human-readable string.
     * @param {Date | null} date - The date to transform.
     * @returns {string} - The transformed date string.
     */
    transform(date: Date | null): string {
        if (!date) return "";

        const inputDate = new Date(date);
        const today = new Date();
        const dateDiff = this.calculateDateDifference(inputDate, today);
        
        if (dateDiff === 0) return "Today";
        if (dateDiff === 1) return "Yesterday";
        if (dateDiff < 7) return inputDate.toLocaleDateString('en-US', { weekday: 'long' });

        return inputDate.toLocaleDateString('en-US');
    }

    /**
     * Calculates the difference in days between two dates.
     * @param {Date} date1 - The first date.
     * @param {Date} date2 - The second date.
     * @returns {number} - The difference in days.
     */
    private calculateDateDifference(date1: Date, date2: Date): number {
        // Normalize the dates to midnight
        const normalizedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const normalizedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
        // Calculate the time difference in milliseconds
        const timeDiff = normalizedDate2.getTime() - normalizedDate1.getTime();
    
        // Convert the time difference to days
        return Math.floor(timeDiff / GetDatePipe.MILLISECONDS_IN_A_DAY);
    }
}
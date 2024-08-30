import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that checks if two dates are on different days.
 * 
 * Usage:
 *   value | isAnotherDay:otherDate
 * Example:
 *   {{ date1 | isAnotherDay:date2 }}
 *   Formats to: true or false
 */
@Pipe({
    name: 'isAnotherDay',
})
export class IsAnotherDay implements PipeTransform {

    /**
     * Transforms two dates and checks if they are on different days.
     * 
     * @param {Date} date1 - The first date to compare.
     * @param {Date} date2 - The second date to compare.
     * @returns {boolean} - True if the dates are on different days, false otherwise.
     */
    transform(date1: Date, date2: Date): boolean {
        const date1String = new Date(date1).toDateString();
        const date2String = new Date(date2).toDateString();
        return date1String !== date2String;
    }
}
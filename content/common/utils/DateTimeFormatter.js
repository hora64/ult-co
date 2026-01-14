export class DateTimeFormatter {
    constructor(userTimeZone = null) {
        this.userTimeZone = userTimeZone;
    }

    format(date, format) {
        const dateTime = this.userTimeZone
            ? luxon.DateTime.fromISO(date).setZone(this.userTimeZone)
            : luxon.DateTime.fromISO(date);
        return dateTime.toFormat(format);
    }

    formatTime(date) {
        const dateTime = this.userTimeZone
            ? luxon.DateTime.fromISO(date).setZone(this.userTimeZone)
            : luxon.DateTime.fromISO(date);
        return dateTime.toLocaleString(luxon.DateTime.TIME_SIMPLE);
    }

    formatDate(date) {
        const dateTime = this.userTimeZone
            ? luxon.DateTime.fromISO(date).setZone(this.userTimeZone)
            : luxon.DateTime.fromISO(date);
        return dateTime.toFormat("MM/dd/yy");
    }

    getTimeZoneAbbr(date) {
        const dateTime = this.userTimeZone
            ? luxon.DateTime.fromISO(date).setZone(this.userTimeZone)
            : luxon.DateTime.fromISO(date);
        return dateTime.toFormat("ZZZZ");
    }
}
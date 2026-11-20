import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const formatDate = (date: string | Date, format: string = "DD/MM/YYYY") => {
    return dayjs.utc(date).format(format);
}
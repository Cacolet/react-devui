import dayjs from 'dayjs';
import { isArray, isDate } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

export default dayjs;

export function deepCompareDate(a: Date | null | [Date, Date], b: Date | null | [Date, Date], format: string) {
  const isSame = (t1: Date, t2: Date) => dayjs(t1).format(format) === dayjs(t2).format(format);
  if (isDate(a) && isDate(b)) {
    return isSame(a, b);
  } else if (isArray(a) && isArray(b)) {
    return isSame(a[0], b[0]) && isSame(a[1], b[1]);
  }
  return false;
}

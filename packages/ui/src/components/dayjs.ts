import d from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';

d.extend(customParseFormat);
d.extend(localeData);

export const dayjs = d;

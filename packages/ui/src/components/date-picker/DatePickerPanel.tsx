import type { Dayjs } from 'dayjs';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { DoubleLeftOutlined, DoubleRightOutlined, LeftOutlined, RightOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { dayjs } from '../dayjs';

export interface DDatePickerPanelProps {
  dDate: Date | null;
  dConfigOptions?: (date: Date) => { disabled?: boolean };
  onDateChange?: (time: Date) => void;
}

export function DDatePickerPanel(props: DDatePickerPanelProps) {
  const { dDate, dConfigOptions, onDateChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t, lang] = useTranslation();

  const activeDate = dDate ? dayjs(dDate) : dayjs();

  const options: Dayjs[][] = (() => {
    const firstDay = activeDate.set('date', 1);
    const month = [];
    let week = [];
    for (let num = 0, addDay = -firstDay.day(); num < 7 * 6; num++, addDay++) {
      week.push(firstDay.add(addDay, 'day'));
      if (week.length === 7) {
        month.push(week);
        week = [];
      }
    }
    return month;
  })();

  return (
    <div className={`${dPrefix}date-picker-panel`}>
      <div className={`${dPrefix}date-picker-panel__header`}>
        <button
          title={t('DDatePicker', 'Previous year')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker-panel__button`)}
        >
          <DoubleLeftOutlined />
        </button>
        <button
          title={t('DDatePicker', 'Previous month')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker-panel__button`)}
        >
          <LeftOutlined />
        </button>
        <span className={`${dPrefix}date-picker-panel__header-content`}>
          {activeDate.format(lang === 'zh-Hant' ? 'YYYY年 M月' : 'MMM YYYY')}
        </span>
        <button
          title={t('DDatePicker', 'Next month')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker-panel__button`)}
        >
          <RightOutlined />
        </button>
        <button
          title={t('DDatePicker', 'Next year')}
          className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-picker-panel__button`)}
        >
          <DoubleRightOutlined />
        </button>
      </div>
      <table className={`${dPrefix}date-picker-panel__content`}>
        <thead>
          <tr>
            {dayjs.weekdaysMin().map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.map((week, index) => (
            <tr key={index}>
              {week.map((d) => {
                const dateNum = d.get('date');
                const { disabled } = dConfigOptions?.(d.toDate()) ?? {};

                return (
                  <td
                    key={dateNum}
                    className={getClassName(`${dPrefix}date-picker-panel__cell`, {
                      [`${dPrefix}date-picker-panel__cell--out-month`]: d.get('month') !== activeDate.get('month'),
                      [`${dPrefix}date-picker-panel__cell--today`]: d.isSame(dayjs(), 'date'),
                      'is-active': dDate && d.isSame(activeDate, 'date'),
                      'is-disabled': disabled,
                    })}
                    onClick={() => {
                      onDateChange?.(d.toDate());
                    }}
                  >
                    {dateNum}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

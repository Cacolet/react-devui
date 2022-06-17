import type { DFormControl } from '../form';

import { freeze } from 'immer';

import { usePrefixConfig } from '../../hooks';

const [H24, M60, S60] = [24, 60, 60].map((num) =>
  freeze(
    Array(num)
      .fill(0)
      .map((n, i) => `${i < 10 ? '0' : ''}${i}`)
  )
);

export interface DTimePickerPanelProps {
  dFormat?: string;
  dDisabledTime?: (time: Date) => {
    hours?: number[];
    minutes?: number[];
    seconds?: number[];
  };
  dStep?: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
  d12Hour?: boolean;
}

export function DTimePickerPanel(props: DTimePickerPanelProps) {
  const { dFormat, dDisabledTime, dStep, d12Hour = false } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const handleCellClick: React.MouseEventHandler<HTMLLIElement> = (e) => {
    e.currentTarget.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  return (
    <>
      <ul className={`${dPrefix}time-picker-panel__column`}>
        {H24.map((h) => (
          <li key={h} className={`${dPrefix}time-picker-panel__cell`} onClick={handleCellClick}>
            {h}
          </li>
        ))}
      </ul>
      <ul className={`${dPrefix}time-picker-panel__column`}>
        {M60.map((h) => (
          <li key={h} className={`${dPrefix}time-picker-panel__cell`} onClick={handleCellClick}>
            {h}
          </li>
        ))}
      </ul>
      <ul className={`${dPrefix}time-picker-panel__column`}>
        {S60.map((h) => (
          <li key={h} className={`${dPrefix}time-picker-panel__cell`} onClick={handleCellClick}>
            {h}
          </li>
        ))}
      </ul>
    </>
  );
}

import type { DTimePickerProps } from '../time-picker';
import type { DPickerBuilderProps } from '../time-picker/PickerBuilder';
import type { DTimePickerPanelRef } from '../time-picker/TimePickerPanel';

import { isBoolean, isUndefined } from 'lodash';
import React, { useRef } from 'react';

import { useComponentConfig, usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName, registerComponentMate } from '../../utils';
import { DButton } from '../button';
import { DPickerBuilder } from '../time-picker/PickerBuilder';
import { orderDate } from '../time-picker/utils';
import { DDatePickerPanel } from './DatePickerPanel';

export interface DDatePickerRef {
  updatePosition: () => void;
}

export interface DDatePickerProps extends Omit<DPickerBuilderProps, 'dFormat' | 'dPlaceholder' | 'dOrder' | 'onUpdatePanel'> {
  dFormat?: string;
  dPlaceholder?: string | [string?, string?];
  dOrder?: 'ascend' | 'descend' | null;
  dConfigOptions?: (date: Date, position: 'start' | 'end', current: [Date | null, Date | null]) => { disabled?: boolean };
  dShowTime?: boolean | Pick<DTimePickerProps, 'd12Hour' | 'dConfigOptions'>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDatePicker' });
function DatePicker(props: DDatePickerProps, ref: React.ForwardedRef<DDatePickerRef>) {
  const {
    dFormat,
    dPlaceholder,
    dOrder = 'ascend',
    dRange = false,
    dConfigOptions,
    dPopupClassName,
    dShowTime = false,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dTPPRef = useRef<DTimePickerPanelRef>(null);
  //#endregion

  const [t] = useTranslation();

  const format = isUndefined(dFormat)
    ? dShowTime
      ? !isBoolean(dShowTime) && dShowTime.d12Hour
        ? 'YYYY-MM-DD hh:mm:ss A'
        : 'YYYY-MM-DD HH:mm:ss'
      : `YYYY-MM-DD`
    : dFormat;

  const [placeholderLeft = t('DDatePicker', dRange ? 'Start date' : 'Select date'), placeholderRight = t('DDatePicker', 'End date')] = (
    dRange ? dPlaceholder ?? [] : [dPlaceholder]
  ) as [string?, string?];

  return (
    <DPickerBuilder
      {...restProps}
      ref={ref}
      className={getClassName(className, `${dPrefix}date-picker`)}
      dFormat={format}
      dPlaceholder={[placeholderLeft, placeholderRight]}
      dOrder={(date) => orderDate(date, dOrder, dShowTime ? undefined : 'date')}
      dRange={dRange}
      dPopupClassName={getClassName(dPopupClassName, `${dPrefix}date-picker__popup`)}
      onUpdatePanel={(date) => {
        dTPPRef.current?.scrollToTime(date);
      }}
    >
      {({ pbDate, pbCurrentDate, pbPosition, changeValue }) => (
        <>
          <DDatePickerPanel
            dDate={pbDate}
            dConfigOptions={dConfigOptions ? (...args) => dConfigOptions(...args, pbPosition, pbCurrentDate) : undefined}
            onDateChange={changeValue}
          ></DDatePickerPanel>
          <div className={`${dPrefix}date-picker__footer`}>
            <DButton
              dType="link"
              onClick={() => {
                const now = new Date();
                changeValue(now);
                dTPPRef.current?.scrollToTime(now);
              }}
            >
              {t('DDatePicker', 'Today')}
            </DButton>
          </div>
        </>
      )}
    </DPickerBuilder>
  );
}

export const DDatePicker = React.forwardRef(DatePicker);

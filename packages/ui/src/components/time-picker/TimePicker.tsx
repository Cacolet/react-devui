import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DSize } from '../../utils/global';
import type { DExtendsTimeInputProps } from '../_time-input';
import type { DFormControl } from '../form';
import type { DTimePickerPanelProps } from './TimePickerPanel';

import { freeze } from 'immer';
import { isArray, isNull } from 'lodash';
import React, { useEffect, useId, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import { useAsync, useElement, useEventCallback, useImmer, useMaxIndex, usePrefixConfig } from '../../hooks';
import { useTwoWayBinding } from '../../hooks/common/useTwoWayBinding';
import { ClockCircleOutlined } from '../../icons';
import { getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DSelectbox } from '../_selectbox';
import { DTimeInput } from '../_time-input';
import { DTransition } from '../_transition';
import { DInput } from '../input';
import { DTimePickerPanel } from './TimePickerPanel';
import dayjs, { deepCompareDate } from './utils';

export interface DTimePickerRef {
  updatePosition: () => void;
}

export interface DTimePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    DExtendsTimeInputProps,
    DTimePickerPanelProps {
  dModel?: [Date | null | [Date, Date], DUpdater<any>?];
  dFormat?: string;
  dVisible?: [boolean, DUpdater<boolean>?];
  dPlaceholder?: string;
  dPopupClassName?: string;
  onModelChange?: (value: any) => void;
}

const TTANSITION_DURING = 116;
function TimePicker(props: DTimePickerProps, ref: React.ForwardedRef<DTimePickerRef>) {
  const {
    dModel,
    dFormat,
    dVisible,
    dPlaceholder,
    dPopupClassName,
    onModelChange,

    dFormControl,
    dSize,
    dRange = false,
    dDisabled = false,
    onVisibleChange,
    onClear,

    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  //#endregion

  const asyncCapture = useAsync();

  const uniqueId = useId();

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const [inputPropsLeft, inputPropsRight] = (dRange ? dInputProps ?? [] : [dInputProps]) as [
    React.InputHTMLAttributes<HTMLInputElement>?,
    React.InputHTMLAttributes<HTMLInputElement>?
  ];
  const [inputRefLeft, inputRefRight] = (dRange ? dInputRef ?? [] : [dInputRef]) as [
    React.Ref<HTMLInputElement>?,
    React.Ref<HTMLInputElement>?
  ];

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);
  const [_value, changeValue] = useTwoWayBinding<Date | null | [Date, Date]>(null, dModel, onModelChange, {
    formControl: dFormControl?.control,
    deepCompare: (a, b) => deepCompareDate(a, b, dFormat),
  });

  const [valueLeft, valueRight = null] = (isNull(_value) ? [null, null] : dRange ? _value : [_value]) as [Date | null, Date | null];

  const [inputValue, setInputValue] = useImmer(() => [valueLeft, valueRight].map((v) => (isNull(v) ? '' : dayjs(v).format(dFormat))));

  return (
    <DTimeInput
      {...restProps}
      ref={ref}
      className={getClassName(className, `${dPrefix}time-picker`)}
      dFormControl={dFormControl}
      dVisible={visible}
      dSize={size}
      dRange={dRange}
      dDisabled={disabled}
      dInputProps={[
        {
          ...inputPropsLeft,
          value: inputValue[0],
          onChange: (e) => {
            inputPropsLeft?.onChange?.(e);

            setInputValue((draft) => {
              draft[0] = e.currentTarget.value;
            });
            if (dayjs(e.currentTarget.value, dFormat, true).isValid()) {
              if (dRange) {
                changeValue((draft) => {
                  draft[0] = dayjs(e.currentTarget.value, dFormat).toDate();
                });
              } else {
                changeValue();
              }
            }
            if (dSearchable) {
              setSearchValue(e.currentTarget.value);
              onSearch?.(e.currentTarget.value);
            }
          },
        },
      ]}
      dInputRef={[inputRefLeft, inputRefRight]}
      onVisibleChange={changeVisible}
      onClear={() => {
        onClear?.();

        changeValue(null);
      }}
    >
      {({ tiStyle, tiOnMouseDown, tiOnMouseUp, ...restSProps }) => (
        <div
          {...restSProps}
          ref={popupRef}
          className={getClassName(dPopupClassName, `${dPrefix}time-picker__popup`)}
          style={tiStyle}
          onMouseDown={tiOnMouseDown}
          onMouseUp={tiOnMouseUp}
        >
          <DTimePickerPanel></DTimePickerPanel>
        </div>
      )}
    </DTimeInput>
  );
}

export const DTimePicker = React.forwardRef(TimePicker);

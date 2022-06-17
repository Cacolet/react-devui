import type { DSize } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import {
  usePrefixConfig,
  useTranslation,
  useAsync,
  useForkRef,
  useEventCallback,
  useMaxIndex,
  useElement,
  useUpdatePosition,
} from '../../hooks';
import { getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DBaseInput } from '../_base-input';
import { DBaseSupport } from '../_base-support';
import { DTransition } from '../_transition';

export type DExtendsTimeInputProps = Pick<
  DTimeInputProps,
  'dFormControl' | 'dPlacement' | 'dSize' | 'dRange' | 'dClearable' | 'dDisabled' | 'onClear' | 'onVisibleChange'
>;

export interface DTimeInputRef {
  updatePosition: () => void;
}

export interface DTimeInputRenderProps {
  tiStyle: React.CSSProperties;
  'data-time-input-popupid': string;
  tiOnMouseDown: React.MouseEventHandler;
  tiOnMouseUp: React.MouseEventHandler;
}

export interface DTimeInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: DTimeInputRenderProps) => JSX.Element | null;
  dFormControl?: DFormControl;
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dSize?: DSize;
  dRange?: boolean;
  dClearable?: boolean;
  dDisabled?: boolean;
  dInputProps?: [React.InputHTMLAttributes<HTMLInputElement>?, React.InputHTMLAttributes<HTMLInputElement>?];
  dInputRef?: [React.Ref<HTMLInputElement>?, React.Ref<HTMLInputElement>?];
  onVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

const TTANSITION_DURING = 116;
function TimeInput(props: DTimeInputProps, ref: React.ForwardedRef<DTimeInputRef>) {
  const {
    children,
    dFormControl,
    dVisible = false,
    dPlacement = 'bottom-left',
    dSize,
    dRange = false,
    dClearable = false,
    dDisabled = false,
    dInputProps,
    dInputRef,
    onVisibleChange,

    className,
    onMouseDown,
    onMouseUp,
    onClick,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRefL = useRef<HTMLInputElement>(null);
  const inputRefR = useRef<HTMLInputElement>(null);
  //#endregion

  const [inputPropsLeft, inputPropsRight] = dInputProps ?? [];
  const [inputRefLeft, inputRefRight] = dInputRef ?? [];

  const combineInputRefL = useForkRef(inputRefL, inputRefLeft);
  const combineInputRefR = useForkRef(inputRefR, inputRefRight);

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const uniqueId = useId();

  const [isFocus, setIsFocus] = useState(false);

  const iconSize = dSize === 'smaller' ? 12 : dSize === 'larger' ? 16 : 14;

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}time-input-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}time-input-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const maxZIndex = useMaxIndex(dVisible);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    const popupEl = document.querySelector(`[data-time-input-popupid="${uniqueId}"]`) as HTMLElement | null;
    if (boxRef.current && popupEl) {
      const { width, height } = getNoTransformSize(popupEl);
      const { top, left, transformOrigin } = getVerticalSidePosition(boxRef.current, { width, height }, dPlacement, 8);
      setPopupPositionStyle({ top, left });
      setTransformOrigin(transformOrigin);
    }
  });

  useUpdatePosition(updatePosition, dVisible);

  useEffect(() => {
    if (dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      if (boxRef.current) {
        asyncGroup.onResize(boxRef.current, () => {
          updatePosition();
        });
      }

      const popupEl = document.querySelector(`[data-time-input-popupid="${uniqueId}"]`) as HTMLElement | null;
      if (popupEl) {
        asyncGroup.onResize(popupEl, () => {
          updatePosition();
        });
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dVisible, uniqueId, updatePosition]);

  useEffect(() => {
    if (dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            onVisibleChange?.(false);
          },
        });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, onVisibleChange, dVisible]);

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      updatePosition,
    }),
    [updatePosition]
  );

  return (
    <>
      <DBaseSupport dCompose={{ active: isFocus, disabled: dDisabled }} dFormControl={dFormControl}>
        <div
          {...restProps}
          ref={boxRef}
          className={getClassName(className, `${dPrefix}time-input`, {
            [`${dPrefix}time-input--${dSize}`]: dSize,
            'is-disabled': dDisabled,
            'is-focus': isFocus,
          })}
          onMouseDown={(e) => {
            onMouseDown?.(e);

            preventBlur(e);
          }}
          onMouseUp={(e) => {
            onMouseUp?.(e);

            preventBlur(e);
          }}
          onClick={(e) => {
            onClick?.(e);

            onVisibleChange?.(!dVisible);
            inputRefL.current?.focus({ preventScroll: true });
          }}
        >
          <DBaseInput
            {...inputPropsLeft}
            ref={combineInputRefL}
            className={getClassName(inputPropsLeft?.className, `${dPrefix}time-input__input`)}
            type="text"
            autoComplete="off"
            disabled={dDisabled}
            dFormControl={dFormControl}
            onChange={(e) => {
              inputPropsLeft?.onChange?.(e);

              onVisibleChange?.(true);
            }}
            onKeyDown={(e) => {
              inputPropsLeft?.onKeyDown?.(e);

              if (!dVisible) {
                if (e.code === 'Space' || e.code === 'Enter') {
                  e.preventDefault();

                  onVisibleChange?.(true);
                }
              }
            }}
            onFocus={(e) => {
              inputPropsLeft?.onFocus?.(e);

              setIsFocus(true);
            }}
            onBlur={(e) => {
              inputPropsLeft?.onBlur?.(e);

              setIsFocus(false);
              onVisibleChange?.(false);
            }}
          />
        </div>
      </DBaseSupport>
      {containerEl &&
        ReactDOM.createPortal(
          <DTransition dIn={dVisible} dDuring={TTANSITION_DURING} onEnterRendered={updatePosition}>
            {(state) => {
              let transitionStyle: React.CSSProperties = {};
              switch (state) {
                case 'enter':
                  transitionStyle = { transform: 'scaleY(0.7)', opacity: 0 };
                  break;

                case 'entering':
                  transitionStyle = {
                    transition: `transform ${TTANSITION_DURING}ms ease-out, opacity ${TTANSITION_DURING}ms ease-out`,
                    transformOrigin,
                  };
                  break;

                case 'leaving':
                  transitionStyle = {
                    transform: 'scaleY(0.7)',
                    opacity: 0,
                    transition: `transform ${TTANSITION_DURING}ms ease-in, opacity ${TTANSITION_DURING}ms ease-in`,
                    transformOrigin,
                  };
                  break;

                case 'leaved':
                  transitionStyle = { display: 'none' };
                  break;

                default:
                  break;
              }

              return children({
                tiStyle: {
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex: maxZIndex,
                },
                'data-time-input-popupid': uniqueId,
                tiOnMouseDown: preventBlur,
                tiOnMouseUp: preventBlur,
              });
            }}
          </DTransition>,
          containerEl
        )}
    </>
  );
}

export const DTimeInput = React.forwardRef(TimeInput);

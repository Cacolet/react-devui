import type { DMenuMode } from './Menu';
import type { Subject } from 'rxjs';

import { useState, useRef, useEffect, useCallback } from 'react';

import { useElement } from '@react-devui/hooks';
import { CaretDownOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName, getHorizontalSidePosition, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';

import { usePrefixConfig, useTranslation, useMaxIndex } from '../../hooks';
import { TTANSITION_DURING_BASE, TTANSITION_DURING_POPUP } from '../../utils';
import { DPopup } from '../_popup';
import { DCollapseTransition, DTransition } from '../_transition';

export interface DSubProps {
  children: React.ReactNode;
  dId: string;
  dDisabled?: boolean;
  dPosinset: [number, number];
  dMode: DMenuMode;
  dInNav: boolean;
  dActive: boolean;
  dExpand: boolean;
  dFocusVisible: boolean;
  dList: React.ReactNode;
  dPopupVisible: boolean;
  dPopupState: boolean;
  dEmpty: boolean;
  dTrigger: 'hover' | 'click';
  dIcon?: React.ReactNode;
  dStep: number;
  dSpace: number;
  dLevel?: number;
  onVisibleChange: (visible: boolean) => void;
  onSubClick: React.MouseEventHandler<HTMLLIElement>;
  updatePosition$: Subject<void>;
}

export function DSub(props: DSubProps): JSX.Element | null {
  const {
    children,
    dId,
    dDisabled,
    dPosinset,
    dMode,
    dInNav,
    dActive,
    dExpand,
    dFocusVisible,
    dList,
    dPopupVisible,
    dPopupState,
    dEmpty,
    dTrigger,
    dIcon,
    dStep,
    dSpace,
    dLevel = 0,
    onVisibleChange,
    onSubClick,
    updatePosition$,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLUListElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  //#endregion

  const [t] = useTranslation();

  const inHorizontalNav = dMode === 'horizontal' && dInNav;

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}menu-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}menu-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useCallback(() => {
    if (popupRef.current && liRef.current) {
      const size = getOriginalSize(popupRef.current);
      const height = size.height;

      let width = size.width;
      if (inHorizontalNav) {
        width = liRef.current.getBoundingClientRect().width - 32;
      }

      const { top, left, transformOrigin } = inHorizontalNav
        ? getVerticalSidePosition(liRef.current, { width, height }, 'bottom-left', 12)
        : getHorizontalSidePosition(liRef.current, { width, height }, 'right', dInNav ? 10 : 14);
      setPopupPositionStyle({
        top,
        left: inHorizontalNav ? left + 16 : left,
        width: inHorizontalNav ? width : undefined,
      });
      setTransformOrigin(transformOrigin);
    }
  }, [dInNav, inHorizontalNav]);

  const maxZIndex = useMaxIndex(dPopupVisible);

  const iconRotate = (() => {
    if (dMode === 'vertical' && dExpand) {
      return 180;
    }
    if (dMode !== 'vertical' && !inHorizontalNav) {
      return -90;
    }
    return undefined;
  })();

  useEffect(() => {
    if (dPopupVisible) {
      const ob = updatePosition$.subscribe({
        next: () => {
          updatePosition();
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [dPopupVisible, updatePosition, updatePosition$]);

  return (
    <DCollapseTransition
      dSize={0}
      dIn={dMode === 'vertical' || !dInNav ? dExpand : false}
      dDuring={TTANSITION_DURING_BASE}
      dStyles={{
        entering: {
          transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
        },
        leaving: {
          transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
        },
        leaved: { display: 'none' },
      }}
    >
      {(collapseRef, collapseStyle, collapseState) => (
        <>
          <DPopup
            dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
              <DTransition dIn={dPopupVisible} dDuring={TTANSITION_DURING_POPUP} onEnterRendered={updatePosition}>
                {(popupState) => {
                  let popupTransitionStyle: React.CSSProperties = {};
                  switch (popupState) {
                    case 'enter':
                      popupTransitionStyle = { transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)', opacity: 0 };
                      break;

                    case 'entering':
                      popupTransitionStyle = {
                        transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-out`).join(', '),
                        transformOrigin,
                      };
                      break;

                    case 'leaving':
                      popupTransitionStyle = {
                        transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)',
                        opacity: 0,
                        transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-in`).join(', '),
                        transformOrigin,
                      };
                      break;

                    case 'leaved':
                      popupTransitionStyle = { display: 'none' };
                      break;

                    default:
                      break;
                  }

                  return (
                    <ul
                      {...restPProps}
                      ref={popupRef}
                      className={getClassName(`${dPrefix}menu__sub-list`, `${dPrefix}menu__sub-list--popup`)}
                      style={{
                        ...popupPositionStyle,
                        ...popupTransitionStyle,
                        minWidth: inHorizontalNav ? undefined : 160,
                        zIndex: maxZIndex,
                      }}
                      role="menu"
                      aria-labelledby={dId}
                      onClick={pOnClick}
                      onMouseEnter={pOnMouseEnter}
                      onMouseLeave={pOnMouseLeave}
                    >
                      {dEmpty ? (
                        <div className={`${dPrefix}menu__empty`} style={{ paddingLeft: dSpace + dLevel * dStep }}>
                          {t('No Data')}
                        </div>
                      ) : (
                        dList
                      )}
                    </ul>
                  );
                }}
              </DTransition>
            )}
            dVisible={dPopupState}
            dContainer={containerEl}
            dDisabled={dDisabled || dMode === 'vertical'}
            dTrigger={dTrigger}
            dUpdatePosition={updatePosition}
            onVisibleChange={onVisibleChange}
          >
            {({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
              <li
                {...restPProps}
                ref={liRef}
                id={dId}
                className={getClassName(`${dPrefix}menu__item`, `${dPrefix}menu__item--sub`, {
                  [`${dPrefix}menu__item--horizontal`]: inHorizontalNav,
                  [`${dPrefix}menu__item--icon`]: dMode === 'icon' && dInNav,
                  'is-active': dActive,
                  'is-expand': dMode === 'vertical' ? dExpand : dPopupVisible,
                  'is-disabled': dDisabled,
                })}
                style={{ paddingLeft: dSpace + dLevel * dStep }}
                role="menuitem"
                aria-haspopup
                aria-expanded={dMode === 'vertical' ? dExpand : dPopupVisible}
                aria-disabled={dDisabled}
                onClick={(e) => {
                  pOnClick?.(e);

                  onSubClick(e);
                }}
                onMouseEnter={pOnMouseEnter}
                onMouseLeave={pOnMouseLeave}
              >
                {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
                <div
                  className={getClassName(`${dPrefix}menu__indicator`, {
                    [`${dPrefix}menu__indicator--first`]: dPosinset[0] === 0 && dPosinset[1] > 1,
                    [`${dPrefix}menu__indicator--last`]: dPosinset[0] === dPosinset[1] - 1 && dPosinset[1] > 1,
                  })}
                >
                  <div style={{ backgroundColor: dLevel === 0 ? 'transparent' : undefined }}></div>
                </div>
                {checkNodeExist(dIcon) && (
                  <div className={`${dPrefix}menu__item-icon-wrapper`}>
                    <div className={`${dPrefix}menu__item-icon`}>{dIcon}</div>
                  </div>
                )}
                <div className={`${dPrefix}menu__item-content`}>{children}</div>
                {!inHorizontalNav && <CaretDownOutlined className={`${dPrefix}menu__sub-arrow`} dSize={14} dRotate={iconRotate} />}
              </li>
            )}
          </DPopup>
          {dMode !== 'vertical' && (collapseState === 'leaved' || !dInNav) ? null : (
            <ul ref={collapseRef} className={`${dPrefix}menu__sub-list`} style={collapseStyle} role="menu" aria-labelledby={dId}>
              {dEmpty ? (
                <div className={`${dPrefix}menu__empty`} style={{ paddingLeft: dSpace + (dLevel + 1) * dStep }}>
                  {t('No Data')}
                </div>
              ) : (
                dList
              )}
            </ul>
          )}
        </>
      )}
    </DCollapseTransition>
  );
}

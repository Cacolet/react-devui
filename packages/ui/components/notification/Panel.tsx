import { isUndefined } from 'lodash';
import React, { useId } from 'react';

import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, ExclamationCircleOutlined, WarningOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useTranslation } from '../../hooks';

export interface DPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dClassNamePrefix: string;
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDescription?: React.ReactNode;
  dActions?: React.ReactNode[];
  onClose?: () => void;
}

function Panel(props: DPanelProps, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element | null {
  const {
    dClassNamePrefix,
    dType,
    dIcon,
    dTitle,
    dDescription,
    dActions = ['close'],
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const [t] = useTranslation();

  const uniqueId = useId();
  const titleId = `${prefix}-title-${uniqueId}`;
  const contentId = `${prefix}-content-${uniqueId}`;

  return (
    <div
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, prefix, {
        [`t-${dType === 'info' ? 'primary' : dType === 'error' ? 'danger' : dType}`]: dType,
      })}
      aria-labelledby={restProps['aria-labelledby'] ?? titleId}
      aria-describedby={restProps['aria-describedby'] ?? contentId}
    >
      {dIcon !== false && (!isUndefined(dType) || checkNodeExist(dIcon)) && (
        <div className={`${prefix}__icon`}>
          {checkNodeExist(dIcon)
            ? dIcon
            : React.createElement(
                dType === 'success'
                  ? CheckCircleOutlined
                  : dType === 'warning'
                  ? WarningOutlined
                  : dType === 'error'
                  ? CloseCircleOutlined
                  : ExclamationCircleOutlined
              )}
        </div>
      )}
      <div id={contentId} className={`${prefix}__content`}>
        <div className={`${prefix}__header`}>
          <div id={titleId} className={`${prefix}__title`}>
            {dTitle}
          </div>
          <div className={`${prefix}__header-actions`}>
            {React.Children.map(dActions, (action) =>
              action === 'close' ? (
                <button key="$$close" className={`${prefix}__close`} aria-label={t('Close')} onClick={onClose}>
                  <CloseOutlined dSize="1.2em" />
                </button>
              ) : (
                action
              )
            )}
          </div>
        </div>
        {checkNodeExist(dDescription) && <div className={`${prefix}__description`}>{dDescription}</div>}
      </div>
    </div>
  );
}

export const DPanel = React.forwardRef(Panel);

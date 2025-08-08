'use client';
import React from 'react';
import { createToastHook } from '@gluestack-ui/toast';
import { AccessibilityInfo, Text, View, ViewStyle } from 'react-native';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { cssInterop } from 'nativewind';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/nativewind-utils/withStyleContext';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { useDictionary } from '@/stores/Dictionary';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

const useToast = createToastHook(MotionView, AnimatePresence);
const SCOPE = 'TOAST';

cssInterop(MotionView, { className: 'style' });

const toastStyle = tva({
  base: 'p-4 m-1 rounded-md gap-1 web:pointer-events-auto shadow-hard-5 border-outline-100',
  variants: {
    action: {
      error: 'bg-error-800',
      warning: 'bg-warning-700',
      success: 'bg-success-700',
      info: 'bg-info-700',
      muted: 'bg-background-800',
    },

    variant: {
      solid: '',
      outline: 'border bg-background-0',
    },
  },
});

const toastTitleStyle = tva({
  base: 'text-typography-0 font-medium font-body tracking-md text-left',
  variants: {
    isTruncated: {
      true: '',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {
      '2xs': 'text-2xs',
      'xs': 'text-xs',
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
  },
  parentVariants: {
    variant: {
      solid: '',
      outline: '',
    },
    action: {
      error: '',
      warning: '',
      success: '',
      info: '',
      muted: '',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'outline',
      action: 'error',
      class: 'text-error-800',
    },
    {
      variant: 'outline',
      action: 'warning',
      class: 'text-warning-800',
    },
    {
      variant: 'outline',
      action: 'success',
      class: 'text-success-800',
    },
    {
      variant: 'outline',
      action: 'info',
      class: 'text-info-800',
    },
    {
      variant: 'outline',
      action: 'muted',
      class: 'text-background-800',
    },
  ],
});

const toastDescriptionStyle = tva({
  base: 'font-normal font-body tracking-md text-left',
  variants: {
    isTruncated: {
      true: '',
    },
    bold: {
      true: 'font-bold',
    },
    underline: {
      true: 'underline',
    },
    strikeThrough: {
      true: 'line-through',
    },
    size: {
      '2xs': 'text-2xs',
      'xs': 'text-xs',
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    },
  },
  parentVariants: {
    variant: {
      solid: 'text-typography-50',
      outline: 'text-typography-900',
    },
  },
});

const Root = withStyleContext(View, SCOPE);
type IToastProps = React.ComponentProps<typeof Root> & {
  className?: string;
} & VariantProps<typeof toastStyle>;

const Toast = React.forwardRef<React.ComponentRef<typeof Root>, IToastProps>(
  function Toast(
    { className, variant = 'solid', action = 'muted', ...props },
    ref
  ) {
    const { state } = useDictionary();
    const { darkMode } = state.settings;
    const isDarkMode = Boolean(darkMode);
    
    // Define background colors based on action and theme
    const getBackgroundColor = () => {
      if (variant === 'outline') {
        return isDarkMode ? '#3E1C00' : '#FFFFFF';
      }
      
      switch (action) {
        case 'error':
          return isDarkMode ? '#B91C1C' : '#DC2626';
        case 'warning':
          return isDarkMode ? '#B45309' : '#D97706';
        case 'success':
          return isDarkMode ? '#15803D' : '#16A34A';
        case 'info':
          return isDarkMode ? '#0369A1' : '#0EA5E9';
        case 'muted':
        default:
          return isDarkMode ? '#3E1C00' : '#4B2C0B';
      }
    };
    
    return (
      <Root
        ref={ref}
        className={toastStyle({ variant, action, class: className })}
        context={{ variant, action }}
        style={{ backgroundColor: getBackgroundColor() }}
        {...props}
      />
    );
  }
);

type IToastTitleProps = React.ComponentProps<typeof Text> & {
  className?: string;
} & VariantProps<typeof toastTitleStyle>;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IToastTitleProps
>(function ToastTitle({ className, size = 'md', children, ...props }, ref) {
  const { variant: parentVariant, action: parentAction } =
    useStyleContext(SCOPE);
  const { state } = useDictionary();
  const { darkMode } = state.settings;
  const isDarkMode = Boolean(darkMode);
  
  // Define text color based on parent variant and theme
  const getTextColor = () => {
    if (parentVariant === 'solid') {
      return '#FFFFFF'; // White text on solid backgrounds
    } else {
      // For outline variant
      switch (parentAction) {
        case 'error':
          return isDarkMode ? '#FCA5A5' : '#DC2626';
        case 'warning':
          return isDarkMode ? '#FCD34D' : '#D97706';
        case 'success':
          return isDarkMode ? '#86EFAC' : '#16A34A';
        case 'info':
          return isDarkMode ? '#7DD3FC' : '#0EA5E9';
        case 'muted':
        default:
          return isDarkMode ? '#E7E4D8' : '#4B2C0B';
      }
    }
  };
  
  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility(children as string);
  }, [children]);

  return (
    <Text
      {...props}
      ref={ref}
      aria-live="assertive"
      aria-atomic="true"
      role="alert"
      className={toastTitleStyle({
        size,
        class: className,
        parentVariants: {
          variant: parentVariant,
          action: parentAction,
        },
      })}
      style={{ color: getTextColor() }}
    >
      {children}
    </Text>
  );
});

type IToastDescriptionProps = React.ComponentProps<typeof Text> & {
  className?: string;
} & VariantProps<typeof toastDescriptionStyle>;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof Text>,
  IToastDescriptionProps
>(function ToastDescription({ className, size = 'md', ...props }, ref) {
  const { variant: parentVariant, action: parentAction } = useStyleContext(SCOPE);
  const { state } = useDictionary();
  const { darkMode } = state.settings;
  const isDarkMode = Boolean(darkMode);
  
  // Define text color based on parent variant and theme
  const getTextColor = () => {
    if (parentVariant === 'solid') {
      return '#FFFFFF'; // White text on solid backgrounds
    } else {
      // For outline variant, slightly lighter than the title
      switch (parentAction) {
        case 'error':
          return isDarkMode ? '#FCA5A5' : '#B91C1C';
        case 'warning':
          return isDarkMode ? '#FCD34D' : '#B45309';
        case 'success':
          return isDarkMode ? '#86EFAC' : '#15803D';
        case 'info':
          return isDarkMode ? '#7DD3FC' : '#0369A1';
        case 'muted':
        default:
          return isDarkMode ? '#E7E4D8' : '#4B2C0B';
      }
    }
  };
  
  return (
    <Text
      ref={ref}
      {...props}
      className={toastDescriptionStyle({
        size,
        class: className,
        parentVariants: {
          variant: parentVariant,
        },
      })}
      style={{ color: getTextColor() }}
    />
  );
});

Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';

export { useToast, Toast, ToastTitle, ToastDescription };

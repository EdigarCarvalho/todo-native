'use client';

import React from 'react';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/icon';
import {
  withStyleContext,
  useStyleContext,
} from '@gluestack-ui/nativewind-utils/withStyleContext';
import type { VariantProps } from '@gluestack-ui/nativewind-utils';
import { createSelect } from '@gluestack-ui/select';
import { cssInterop } from 'nativewind';
import {
  Actionsheet,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetBackdrop,
  ActionsheetScrollView,
  ActionsheetVirtualizedList,
  ActionsheetFlatList,
  ActionsheetSectionList,
  ActionsheetSectionHeaderText,
} from './select-actionsheet';
import { Pressable, View, TextInput } from 'react-native';

const SelectTriggerWrapper = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  React.ComponentProps<typeof Pressable>
>(function SelectTriggerWrapper({ ...props }, ref) {
  return <Pressable {...props} ref={ref} />;
});

const selectIconStyle = tva({
  base: 'text-background-500 fill-none',
  parentVariants: {
    size: {
      '2xs': 'h-3 w-3',
      'xs': 'h-3.5 w-3.5',
      'sm': 'h-4 w-4',
      'md': 'h-[18px] w-[18px]',
      'lg': 'h-5 w-5',
      'xl': 'h-6 w-6',
    },
  },
});

const selectStyle = tva({
  base: '',
});

const selectTriggerStyle = tva({
  base: 'border border-background-300 rounded flex-row items-center overflow-hidden data-[hover=true]:border-outline-400 data-[focus=true]:border-primary-700 data-[disabled=true]:opacity-40 data-[disabled=true]:data-[hover=true]:border-background-300',
  variants: {
    size: {
      xl: 'h-12',
      lg: 'h-11',
      md: 'h-10',
      sm: 'h-9',
    },
    variant: {
      underlined:
        'border-0 border-b rounded-none data-[hover=true]:border-primary-700 data-[focus=true]:border-primary-700 data-[focus=true]:web:shadow-[inset_0_-1px_0_0] data-[focus=true]:web:shadow-primary-700 data-[invalid=true]:border-error-700 data-[invalid=true]:web:shadow-error-700',
      outline:
        'data-[focus=true]:border-primary-700 data-[focus=true]:web:shadow-[inset_0_0_0_1px] data-[focus=true]:data-[hover=true]:web:shadow-primary-600 data-[invalid=true]:web:shadow-[inset_0_0_0_1px] data-[invalid=true]:border-error-700 data-[invalid=true]:web:shadow-error-700 data-[invalid=true]:data-[hover=true]:border-error-700',
      rounded:
        'rounded-full data-[focus=true]:border-primary-700 data-[focus=true]:web:shadow-[inset_0_0_0_1px] data-[focus=true]:web:shadow-primary-700 data-[invalid=true]:border-error-700 data-[invalid=true]:web:shadow-error-700',
    },
  },
});

const selectInputStyle = tva({
  base: 'py-auto px-3 placeholder:text-typography-500 web:w-full h-full text-typography-900 pointer-events-none web:outline-none ios:leading-[0px]',
  parentVariants: {
    size: {
      xl: 'text-xl',
      lg: 'text-lg',
      md: 'text-base',
      sm: 'text-sm',
    },
    variant: {
      underlined: 'px-0',
      outline: '',
      rounded: 'px-4',
    },
  },
});

// Novo estilo customizado para os itens do select
const selectItemStyle = tva({
  base: 'bg-orange-100 border-b border-orange-200 px-4 py-3 data-[hover=true]:bg-orange-200 data-[focus=true]:bg-orange-200 data-[pressed=true]:bg-orange-200',
});

const selectItemTextStyle = tva({
  base: 'text-amber-800 font-medium text-base',
});

// Estilo para o conteúdo do actionsheet
const selectContentStyle = tva({
  base: 'bg-white rounded-t-xl max-h-[70vh]',
});

const UISelect = createSelect(
  {
    Root: View,
    Trigger: withStyleContext(SelectTriggerWrapper),
    Input: TextInput,
    Icon: UIIcon,
  },
  {
    Portal: Actionsheet,
    Backdrop: ActionsheetBackdrop,
    Content: ActionsheetContent,
    DragIndicator: ActionsheetDragIndicator,
    DragIndicatorWrapper: ActionsheetDragIndicatorWrapper,
    Item: ActionsheetItem,
    ItemText: ActionsheetItemText,
    ScrollView: ActionsheetScrollView,
    VirtualizedList: ActionsheetVirtualizedList,
    FlatList: ActionsheetFlatList,
    SectionList: ActionsheetSectionList,
    SectionHeaderText: ActionsheetSectionHeaderText,
  }
);

cssInterop(UISelect, { className: 'style' });
cssInterop(UISelect.Input, {
  className: { target: 'style', nativeStyleToProp: { textAlign: true } },
});
cssInterop(SelectTriggerWrapper, { className: 'style' });

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

type ISelectProps = VariantProps<typeof selectStyle> &
  React.ComponentProps<typeof UISelect> & {
    className?: string;
    label?: string;
  };

const Select = React.forwardRef<
  React.ElementRef<typeof UISelect>,
  ISelectProps
>(
  ({ className, label, ...props }, ref) => {
    if (label) {
      return (
        <div className="relative">
          <UISelect
            ref={ref}
            {...props}
            className={selectStyle({ class: props?.className })}
          />
          <span className="absolute -top-3 left-4 px-2 bg-[#f9f9f9] dark:bg-[#3E1C00] text-[#4B2C0B] dark:text-[#E7E4D8] font-medium text-sm">
            {label}
          </span>
        </div>
      );
    }

    return (
      <UISelect
        ref={ref}
        {...props}
        className={selectStyle({ class: props?.className })}
      />
    );
  }
);

type ISelectTriggerProps = VariantProps<typeof selectTriggerStyle> &
  React.ComponentProps<typeof UISelect.Trigger> & { className?: string };

const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof UISelect.Trigger>,
  ISelectTriggerProps
>(function SelectTrigger(
  { className, size = 'md', variant = 'outline', ...props },
  ref
) {
  return (
    <UISelect.Trigger
      className={selectTriggerStyle({
        class: className,
        size,
        variant,
      })}
      ref={ref}
      context={{ size, variant }}
      {...props}
    />
  );
});

type ISelectInputProps = VariantProps<typeof selectInputStyle> &
  React.ComponentProps<typeof UISelect.Input> & { className?: string };

const SelectInput = React.forwardRef<
  React.ComponentRef<typeof UISelect.Input>,
  ISelectInputProps
>(function SelectInput({ className, ...props }, ref) {
  const { size: parentSize, variant: parentVariant } = useStyleContext();
  return (
    <UISelect.Input
      className={selectInputStyle({
        class: className,
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
        },
      })}
      ref={ref}
      // placeholder="Selecione uma categoria"
      {...props}
    />
  );
});

type ISelectIcon = VariantProps<typeof selectIconStyle> &
  React.ComponentProps<typeof UISelect.Icon> & { className?: string };

const SelectIcon = React.forwardRef<
  React.ComponentRef<typeof UISelect.Icon>,
  ISelectIcon
>(function SelectIcon({ className, size, ...props }, ref) {
  const { size: parentSize } = useStyleContext();
  if (typeof size === 'number') {
    return (
      <UISelect.Icon
        ref={ref}
        {...props}
        className={selectIconStyle({ class: className })}
        size={size}
      />
    );
  } else if (
    //@ts-expect-error : web only
    (props?.height !== undefined || props?.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UISelect.Icon
        ref={ref}
        {...props}
        className={selectIconStyle({ class: className })}
      />
    );
  }
  return (
    <UISelect.Icon
      className={selectIconStyle({
        class: className,
        size,
        parentVariants: {
          size: parentSize,
        },
      })}
      ref={ref}
      {...props}
    />
  );
});

// Componentes customizados para seguir o estilo da imagem
type ISelectContentProps = VariantProps<typeof selectContentStyle> &
  React.ComponentProps<typeof UISelect.Content> & { className?: string };

const SelectContent = React.forwardRef<
  React.ComponentRef<typeof UISelect.Content>,
  ISelectContentProps
>(function SelectContent({ className, ...props }, ref) {
  return (
    <UISelect.Content
      className={selectContentStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

type ISelectItemProps = VariantProps<typeof selectItemStyle> &
  React.ComponentProps<typeof UISelect.Item> & { className?: string };

const SelectItem = React.forwardRef<
  React.ComponentRef<typeof UISelect.Item>,
  ISelectItemProps
>(function SelectItem({ className, ...props }, ref) {
  return (
    <UISelect.Item
      className={selectItemStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

type ISelectItemTextProps = VariantProps<typeof selectItemTextStyle> &
  React.ComponentProps<typeof UISelect.ItemText> & { className?: string };

const SelectItemText = React.forwardRef<
  React.ComponentRef<typeof UISelect.ItemText>,
  ISelectItemTextProps
>(function SelectItemText({ className, ...props }, ref) {
  return (
    <UISelect.ItemText
      className={selectItemTextStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

Select.displayName = 'Select';
SelectTrigger.displayName = 'SelectTrigger';
SelectInput.displayName = 'SelectInput';
SelectIcon.displayName = 'SelectIcon';
SelectContent.displayName = 'SelectContent';
SelectItem.displayName = 'SelectItem';
SelectItemText.displayName = 'SelectItemText';

// Componentes do Actionsheet mantidos
const SelectPortal = UISelect.Portal;
const SelectBackdrop = UISelect.Backdrop;
const SelectDragIndicator = UISelect.DragIndicator;
const SelectDragIndicatorWrapper = UISelect.DragIndicatorWrapper;
const SelectScrollView = UISelect.ScrollView;
const SelectVirtualizedList = UISelect.VirtualizedList;
const SelectFlatList = UISelect.FlatList;
const SelectSectionList = UISelect.SectionList;
const SelectSectionHeaderText = UISelect.SectionHeaderText;

export {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
  SelectItemText,
  SelectScrollView,
  SelectVirtualizedList,
  SelectFlatList,
  SelectSectionList,
  SelectSectionHeaderText,
};

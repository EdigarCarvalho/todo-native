import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
    Search
} from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";

  interface SearchInputProps {
    value: string;
    onChangeValue: React.Dispatch<React.SetStateAction<string>>;
    CustomInputContent?: React.ReactNode;
    condition?: boolean;
    placeholder?: string;
  }
  
  export function SearchInput({
    value,
    onChangeValue,
    condition,
    CustomInputContent,
    placeholder = "Pesquise uma palavra",
  }: SearchInputProps) {
    const { state } = useDictionary();
    const { darkMode, fontSize } = state.settings;
    const isDarkMode = Boolean(darkMode);

    // Theme colors
    const inputBgColor = isDarkMode ? "#7C4F2C" : "#E7E4D8";
    const textColor = isDarkMode ? "#E7E4D8" : "#212121";
    const iconColor = isDarkMode ? "#E7E4D8" : "#110626";

    return (
      <Input
        variant="rounded"
        size="xl"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="border-none sticky "
        style={{ backgroundColor: inputBgColor }}
        
      >
        {!condition || !CustomInputContent ? (
          <>
            <InputField
              placeholder={placeholder}
              className="text-sm font-normal "
              style={{
                color: textColor,
              }}
              placeholderTextColor={textColor}
              value={value}
              onChangeText={onChangeValue}
            />
            <InputSlot className="mr-5 mt-1">
              <InputIcon>
                <Search size={20} color={iconColor} />
              </InputIcon>
            </InputSlot>
          </>
        ) : (
          CustomInputContent
        )}
      </Input>
    );
  }

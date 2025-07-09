import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
    Search
} from "lucide-react-native";
  

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
    return (
      <Input
        variant="rounded"
        size="xl"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="bg-[#E7E4D8] dark:bg-[#7C4F2C] border-none sticky"
      >
        {!condition || !CustomInputContent ? (
          <>
            <InputField
              placeholder={placeholder}
              className="text-sm placeholder:text-[#474747] font-normal"
              value={value}
              onChangeText={onChangeValue}
            />
            <InputSlot className="mr-5 mt-1">
              <InputIcon>
                <Search size={20} color={"#110626"} />
              </InputIcon>
            </InputSlot>
          </>
        ) : (
          CustomInputContent
        )}
      </Input>
    );
  }

import { Search } from "@mui/icons-material";
import { Input } from "@mui/material";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput = ({ value, onChange }: SearchInputProps) => {
  return (
    <div className="flex relative">
      <Input
        value={value}
        onChange={onChange}
        placeholder="Введите название трека или имя исполнителя..."
        className="w-full"
      />
      <Search
        color="disabled"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
      />
    </div>
  );
};

export default SearchInput;

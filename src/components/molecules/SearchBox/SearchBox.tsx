"use client";

import React from "react";
import { Input, type InputProps } from "../../atoms/Input";
import { Button } from "../../atoms/Button";

export interface SearchBoxProps extends Omit<InputProps, 'rightIcon'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  searchIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
}

export const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ 
    onSearch, 
    onClear, 
    showClearButton = true,
    searchIcon = "🔍",
    clearIcon = "✕",
    value,
    onChange,
    placeholder = "Buscar...",
    ...props 
  }, ref) => {
    const [searchValue, setSearchValue] = React.useState<string>(String(value ?? ""));

    React.useEffect(() => {
      setSearchValue(String(value ?? ""));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchValue(newValue);
      onChange?.(e);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.(searchValue);
      }
    };

    const handleClear = () => {
      setSearchValue("");
      onClear?.();
      const syntheticEvent = {
        target: { value: "" }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    const rightIcon = showClearButton && searchValue ? (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClear}
        className="h-6 w-6 p-0 hover:bg-gray-100"
        type="button"
      >
        {clearIcon}
      </Button>
    ) : undefined;

    return (
      <Input
        ref={ref}
        value={searchValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        leftIcon={searchIcon}
        rightIcon={rightIcon}
        inputSize={props.inputSize}
        {...props}
      />
    );
  }
);

SearchBox.displayName = "SearchBox";

export default SearchBox;

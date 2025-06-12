"use client";

import React from "react";
import { Input, type InputProps } from "../../atoms/Input";
import { Label, type LabelProps } from "../../atoms/Label";
import { cn } from "../../../utils/cn";

export interface FormFieldProps extends InputProps {
  label?: string;
  labelProps?: Omit<LabelProps, 'children'>;
  required?: boolean;
  description?: string;
  containerClassName?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ 
    label, 
    labelProps,
    required = false,
    description,
    containerClassName,
    error,
    id,
    name,
    ...inputProps 
  }, ref) => {
    const fieldId = id || name || `field-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <Label 
            htmlFor={fieldId}
            required={required}
            {...labelProps}
          >
            {label}
          </Label>
        )}
        
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
        
        <Input
          ref={ref}
          id={fieldId}
          name={name}
          error={error}
          inputSize={inputProps.inputSize}
          {...inputProps}
        />
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;

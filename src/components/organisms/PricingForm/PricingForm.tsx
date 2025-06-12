"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, FormField } from "../../molecules";
import { Button, Badge } from "../../atoms";
import { cn } from "../../../utils/cn";

interface PricingOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  features?: string[];
  popular?: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  selectedOption?: string;
}

interface PricingFormProps {
  className?: string;
  title?: string;
  description?: string;
  options?: PricingOption[];
  onSelectOption?: (option: PricingOption) => void;
  showContactForm?: boolean;
  onSubmitContact?: (data: ContactFormData) => void;
  loading?: boolean;
}

const mockPricingOptions: PricingOption[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for individuals",
    price: 9.99,
    features: ["1 User", "Basic Support", "5GB Storage"],
  },
  {
    id: "pro",
    name: "Professional",
    description: "Best for teams",
    price: 24.99,
    features: ["10 Users", "Priority Support", "50GB Storage", "Advanced Analytics"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: 99.99,
    features: ["Unlimited Users", "24/7 Support", "500GB Storage", "Custom Integrations"],
  },
];

const PricingForm: React.FC<PricingFormProps> = ({
  className = "",
  title = "Choose Your Plan",
  description = "Select the plan that best fits your needs",
  options = mockPricingOptions,
  onSelectOption,
  showContactForm = false,
  onSubmitContact,
  loading = false
}) => {
  const [selectedOption, setSelectedOption] = useState<PricingOption | null>(null);
  const [showContact, setShowContact] = useState(showContactForm);
  const [contactData, setContactData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    selectedOption: ""
  });

  const handleSelectOption = (option: PricingOption) => {
    setSelectedOption(option);
    setContactData(prev => ({ ...prev, selectedOption: option.name }));
    onSelectOption?.(option);
    if (!showContactForm) {
      setShowContact(true);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitContact?.(contactData);
  };

  const formatPrice = useMemo(() => (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        {description && <p className="text-lg text-gray-600">{description}</p>}
      </div>

      {/* Pricing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
              selectedOption?.id === option.id && "ring-2 ring-blue-500",
              option.popular && "border-blue-500 bg-blue-50"
            )}
            onClick={() => handleSelectOption(option)}
          >
            {option.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-blue-600">
                  Más Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="text-xl">{option.name}</CardTitle>
              {option.description && (
                <p className="text-sm text-gray-600">{option.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(option.price)}
                </span>
              </div>
              
              {option.features && (
                <ul className="space-y-2 text-sm text-gray-600">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="mt-6">
                <Button
                  variant={selectedOption?.id === option.id ? "default" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOption(option);
                  }}
                >
                  {selectedOption?.id === option.id ? "Seleccionado" : "Seleccionar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Form */}
      {showContact && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            {selectedOption && (
              <p className="text-sm text-gray-600">
                Plan seleccionado: <strong>{selectedOption.name}</strong>
              </p>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Nombre completo"
                  value={contactData.name}
                  onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Tu nombre completo"
                />
                
                <FormField
                  label="Email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              
              <FormField
                label="Teléfono (opcional)"
                type="tel"
                value={contactData.phone || ""}
                onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+56 9 1234 5678"
              />
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={!contactData.name || !contactData.email || loading}
                  className="flex-1"
                >
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContact(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PricingForm;

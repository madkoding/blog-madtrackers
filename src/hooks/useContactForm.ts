"use client";

import { useState } from "react";
import { useRecaptcha } from "./useRecaptcha";

export const useContactForm = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { executeRecaptcha } = useRecaptcha();

  const submitForm = async () => {
    if (!email || !message) return;
    
    setIsSubmitting(true);
    setSubmitStatus("idle");
    
    try {
      // Ejecutar reCAPTCHA
      const recaptchaToken = await executeRecaptcha('contact_form');
      
      if (!recaptchaToken) {
        throw new Error('Error en la verificación de seguridad. Por favor, recarga la página e intenta de nuevo.');
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
          recaptchaToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el mensaje');
      }
      
      setSubmitStatus("success");
      setEmail("");
      setMessage("");
      
      // Reset success message after 2 seconds and close modal
      setTimeout(() => {
        setSubmitStatus("idle");
        setIsModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending contact form:', error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setMessage("");
    setSubmitStatus("idle");
  };

  return {
    // Estados
    email,
    message,
    isSubmitting,
    submitStatus,
    isModalOpen,
    
    // Setters
    setEmail,
    setMessage,
    setIsModalOpen,
    
    // Acciones
    submitForm,
    resetForm,
  };
};

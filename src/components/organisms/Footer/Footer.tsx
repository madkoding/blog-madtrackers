"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "../../../utils/cn";

interface FooterLink {
  href: string;
  label: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  className?: string;
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  companyName?: string;
  description?: string;
  sections?: FooterSection[];
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: FooterLink[];
  showCopyright?: boolean;
  copyrightText?: string;
}

export const Footer = React.memo<FooterProps>(({
  className,
  logo = {
    src: "/assets/madtrackers.svg",
    alt: "madTrackers",
    width: 60,
    height: 60
  },
  companyName = "madTrackers",
  description = "Trackers Slime por fan de VRChat para fans de VRChat.",
  sections = [],
  contactInfo = {},
  socialLinks = [],
  showCopyright = true,
  copyrightText
}) => {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = copyrightText || `© ${currentYear} ${companyName}. Todos los derechos reservados.`;

  const defaultSections: FooterSection[] = [
    {
      title: "Navegación",
      links: [
        { href: "/", label: "Inicio" },
        { href: "/faq", label: "FAQ" },
        { href: "/contacto", label: "Contacto" }
      ]
    },
    {
      title: "Soporte",
      links: [
        { href: "/seguimiento", label: "Seguimiento" },
        { href: "/faq", label: "Preguntas Frecuentes" }
      ]
    }
  ];

  const finalSections = sections.length > 0 ? sections : defaultSections;

  return (
    <footer className={cn("bg-gray-900 text-white", className)}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="filter invert"
              />
              <span className="text-lg font-bold">{companyName}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Secciones de navegación */}
          {finalSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Información de contacto */}
          <div className="lg:col-span-1">
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-sm text-gray-300">
              {contactInfo.email && (
                <p>
                  <span className="text-gray-400">Email: </span>
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </p>
              )}
              {contactInfo.phone && (
                <p>
                  <span className="text-gray-400">Teléfono: </span>
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </p>
              )}
              {contactInfo.address && (
                <p>
                  <span className="text-gray-400">Dirección: </span>
                  {contactInfo.address}
                </p>
              )}
            </div>

            {/* Redes sociales */}
            {socialLinks.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2 text-gray-400">Síguenos</h5>
                <div className="flex space-x-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        {showCopyright && (
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-400">
              {defaultCopyright}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;

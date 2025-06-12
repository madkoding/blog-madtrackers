"use client";

import React from "react";
import { Header } from "../../organisms/Header";
import { Footer } from "../../organisms/Footer";
import { cn } from "../../../utils/cn";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  headerProps?: React.ComponentProps<typeof Header>;
  footerProps?: React.ComponentProps<typeof Footer>;
  containerClassName?: string;
}

export const MainLayout = React.memo<MainLayoutProps>(({
  children,
  className,
  showHeader = true,
  showFooter = true,
  headerProps,
  footerProps,
  containerClassName
}) => {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {showHeader && <Header {...headerProps} />}
      
      <main className={cn(
        "flex-1",
        showHeader && "pt-16 lg:pt-20", // Add padding for fixed header
        containerClassName
      )}>
        {children}
      </main>
      
      {showFooter && <Footer {...footerProps} />}
    </div>
  );
});

MainLayout.displayName = "MainLayout";

export default MainLayout;

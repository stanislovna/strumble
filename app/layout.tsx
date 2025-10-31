import type { Metadata } from "next";
import "./globals.css";
import RQProvider from "@/lib/queryClient"; 

export const metadata: Metadata = {
  title: "Strumble",
  description: "Culture, not infrastructure.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RQProvider> {/* 👈 оборачиваем всё в провайдер */}
          {children}
        </RQProvider>
      </body>
    </html>
  );
}

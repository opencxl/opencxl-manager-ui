import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/app/_components/providers/socket-provider";
import { Suspense } from "react";
import Loading from "./_components/ui/loading";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CXL UI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}

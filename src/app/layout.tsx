import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Layout } from "antd";

import { TRPCReactProvider } from "@/trpc/react";
import SideBar from "@/components/layouts/SideBar";
import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/header/Header";
import { Content } from "antd/es/layout/layout";
import MyBreadcurmb from "./_components/BreadCurmb";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "t3 app 全栈 cli",
  description: "基于 next、tailwind、shadcn、prisma、trpc、zod、antd、antd-pro",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <Suspense>
            <Layout style={{ minHeight: "100vh" }}>
              <Header />
              <Layout>
                <SideBar />
                <Content>
                  <main className="flex h-full w-full flex-col items-center justify-center">
                    <MyBreadcurmb />
                    {children}
                  </main>
                </Content>
              </Layout>
              <Footer />
            </Layout>
          </Suspense>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

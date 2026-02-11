import type {Metadata} from "next";
import {Fraunces, Space_Grotesk} from "next/font/google";
import {AuthStatus} from "./auth-status";
import {InviteButton} from "./invite-button";
import {ProjectSelector} from "./project-selector";
import {AppNav} from "./nav";
import {Providers} from "./providers";
import {QuickAdd} from "./quick-add";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
});

const fraunces = Fraunces({
    variable: "--font-fraunces",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "HeartHub",
    description: "Shared projects, notes, and plans for couples",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}>
        <Providers>
            <div className="app-shell">
                <aside className="app-sidebar">
                    <div className="brand">
                        <span className="brand-dot"/>
                        <span className="brand-title">HeartHub</span>
                    </div>
                    <AppNav />
                    <div className="sidebar-card">
                        <QuickAdd />
                    </div>
                </aside>
                <div className="app-main">
                    <header className="app-header">
                        <ProjectSelector />
                        <div className="header-actions">
                            <InviteButton />
                            <AuthStatus />
                        </div>
                    </header>
                    <main className="app-content">{children}</main>
                </div>
            </div>
        </Providers>
        </body>
        </html>
    );
}

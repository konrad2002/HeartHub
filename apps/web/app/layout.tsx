import type {Metadata} from "next";
import {Fraunces, Space_Grotesk} from "next/font/google";
import {AuthStatus} from "./auth-status";
import {ProjectSelector} from "./project-selector";
import {AppNav} from "./nav";
import {Providers} from "./providers";
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
                        <p className="sidebar-title">Quick add</p>
                        <button className="chip">Note</button>
                        <button className="chip">Training</button>
                        <button className="chip">Place</button>
                    </div>
                </aside>
                <div className="app-main">
                    <header className="app-header">
                        <ProjectSelector />
                        <div className="header-actions">
                            <button className="btn ghost">Invite</button>
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

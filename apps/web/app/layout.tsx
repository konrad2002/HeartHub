import type {Metadata} from "next";
import {Fraunces, Space_Grotesk} from "next/font/google";
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
                    <nav className="nav-group">
                        <a className="nav-item active" href="#">
                            Dashboard
                        </a>
                        <a className="nav-item" href="#">
                            Projects
                        </a>
                        <a className="nav-item" href="#">
                            Notes
                        </a>
                        <a className="nav-item" href="#">
                            Trainings
                        </a>
                        <a className="nav-item" href="#">
                            Locations
                        </a>
                        <a className="nav-item" href="#">
                            Members
                        </a>
                    </nav>
                    <div className="sidebar-card">
                        <p className="sidebar-title">Quick add</p>
                        <button className="chip">Note</button>
                        <button className="chip">Training</button>
                        <button className="chip">Place</button>
                    </div>
                </aside>
                <div className="app-main">
                    <header className="app-header">
                        <div>
                            <p className="eyebrow">Current project</p>
                            <h1 className="header-title">Konrad + Lia</h1>
                        </div>
                        <div className="header-actions">
                            <button className="btn ghost">Invite</button>
                            <button className="btn primary">New project</button>
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

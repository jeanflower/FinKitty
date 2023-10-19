import { Metadata } from "next";
import React from 'react'

export const metadata: Metadata = {
  title: 'FinKitty',
  description:
    'An app for personal financial forecasting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

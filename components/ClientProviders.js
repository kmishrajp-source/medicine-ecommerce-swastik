"use client";
import { CartProvider } from "@/context/CartContext";
import PwaRegistrar from "@/components/PwaRegistrar";
import FCMProvider from "@/components/FCMProvider";
import Provider from "@/components/SessionProvider";
import { NextIntlClientProvider } from 'next-intl';
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AIRecoveryAssistant from "@/components/AIRecoveryAssistant";
import CustomerSupportWidget from "@/components/CustomerSupportWidget";
import CartDrawer from "@/components/CartDrawer";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Layout Error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', margin: '20px' }}>
          <h2>Something went wrong in the components.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientProviders({ children, messages, locale }) {
    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <Provider>
                <FCMProvider>
                    <CartProvider>
                        <ErrorBoundary>
                            <PwaRegistrar />
                            {children}
                            <CartDrawer />
                            <FloatingWhatsApp />
                            <CustomerSupportWidget />
                            <AIRecoveryAssistant />
                        </ErrorBoundary>
                    </CartProvider>
                </FCMProvider>
            </Provider>
        </NextIntlClientProvider>
    );
}

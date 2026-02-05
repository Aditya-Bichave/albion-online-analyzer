import React from 'react';
import { Metadata } from 'next';
import { Receipt, AlertCircle, HelpCircle, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | AlbionKit',
  description: 'AlbionKit Refund Policy. Read about our policies regarding refunds for subscriptions and digital goods.',
  openGraph: {
    title: 'Refund Policy | AlbionKit',
    description: 'AlbionKit Refund Policy. Read about our policies regarding refunds for subscriptions and digital goods.',
    type: 'website',
  },
};
import Image from 'next/image';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-20 px-4 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/faq-bg.jpg"
            alt="Background"
            fill
            className="object-cover opacity-30"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/90 to-background" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-sm font-medium mb-6">
            <Receipt className="h-4 w-4" />
            <span>Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Refund Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We aim to be fair and transparent. Please read our policy regarding refunds for subscriptions and donations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="prose prose-invert prose-lg max-w-none">
          
          <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8 mb-12">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-4 mt-0">
              <AlertCircle className="h-6 w-6 text-warning" />
              1. General Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              AlbionKit provides immediate access to premium digital features and tools (such as Adept and Guild Master tiers). 
              Due to the nature of digital content where access is granted instantly, all sales are generally considered final and non-refundable once the service has been accessed or used.
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-6">
                <Receipt className="h-6 w-6 text-info" />
                2. Subscriptions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <h3 className="font-bold text-foreground m-0">Cancellation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground m-0">
                    You may cancel your subscription at any time via the Settings page. Your access will continue until the end of your current billing period, but you will not be charged again.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <h3 className="font-bold text-foreground m-0">Refund Eligibility</h3>
                  </div>
                  <p className="text-sm text-muted-foreground m-0">
                    Refunds are typically only issued in cases of technical error (e.g., double billing) or if required by local law.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-6">
                <HelpCircle className="h-6 w-6 text-purple-500" />
                3. Exceptions & Disputes
              </h2>
              <p className="text-muted-foreground mb-4">
                We understand that mistakes happen. If you believe a transaction was made in error (e.g., duplicate charge) or you have extenuating circumstances, please contact us within <strong>7 days</strong> of the transaction.
              </p>
              <ul className="bg-card p-6 rounded-xl border border-border list-none pl-4 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2.5" />
                  <span className="text-muted-foreground">Accidental double charges will be refunded immediately upon verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2.5" />
                  <span className="text-muted-foreground">Forgotten cancellations may be considered for a refund if the service was not used during the renewal period (subject to review).</span>
                </li>
              </ul>
            </section>

            <section className="bg-card/50 border border-border rounded-xl p-8">
              <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-4 mt-0">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
                Contact Us
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  If you have any questions about our Refund Policy or need to request a refund, please reach out to us through any of the following channels:
                </p>
                <ul className="list-none space-y-2 pl-4 border-l-2 border-border">
                  <li>
                    <strong className="text-foreground">Email:</strong> <a href="mailto:contact@albionkit.com" className="hover:text-primary transition-colors">contact@albionkit.com</a>
                  </li>
                  <li>
                    <strong className="text-foreground">Twitter (X):</strong> <a href="https://twitter.com/Albion_Kit" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@Albion_Kit</a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

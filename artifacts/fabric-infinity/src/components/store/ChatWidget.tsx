import { useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import logo from '@assets/codex-clipboard-ba1642ba-86e7-4917-8383-f749aa153b92_1785595081553.jpg';

type Tab = 'whatsapp' | 'email' | 'faq';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

// WhatsApp number from environment variable (set via Replit Secrets / env vars)
const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;

// ── FAQ keyword responder ────────────────────────────────────────────────────
const FAQ_RESPONSES: Array<{ match: string[]; reply: string }> = [
  {
    match: ['price', 'cost', 'rate', 'how much', 'kitna'],
    reply: 'Our fabrics start from ₹299/metre. Pricing varies by fabric type — browse the Shop page for exact prices on each product.',
  },
  {
    match: ['ship', 'deliver', 'dispatch', 'days'],
    reply: 'We deliver pan-India. Orders above ₹999 get free shipping. Standard delivery is 5–7 business days; express options are available at checkout.',
  },
  {
    match: ['return', 'exchange', 'refund', 'cancel'],
    reply: 'We accept returns within 7 days of delivery for unused, uncut fabric in its original condition. Contact us on WhatsApp to initiate a return.',
  },
  {
    match: ['ajrakh', 'ikat', 'block print', 'handloom', 'dabu', 'bagru'],
    reply: 'We carry authentic Ajrakh (cotton & modal silk), Ikat, Dabu, Bagru, and many more hand block prints — all ethically sourced from artisans in Rajasthan and Gujarat.',
  },
  {
    match: ['saree', 'sari'],
    reply: 'We stock Modal Silk, Kota Doria, Chanderi, Georgette, Maheshwari, Cotton Handblock, and more. Browse Sarees from the top menu!',
  },
  {
    match: ['dupatta'],
    reply: 'Our dupatta collection includes Ikkat, Banarasi, Kalamkari, Ajrakh Modal, Bandhani, and Brush Print. Shop Dupattas from the top menu.',
  },
  {
    match: ['suit', 'dress material', 'salwar'],
    reply: 'We carry Jaipuri Handblock, Kota Doria, Modal Silk, Cotton Linen, Maheshwari Silk, and Cotton Print suit sets. See Dress Materials in the menu.',
  },
  {
    match: ['cotton', 'fabric', 'material'],
    reply: 'We have Plain Cotton (Cambric 60×60, Slub, Khadi), Cotton Blends, Slub Silk, and Screen Prints. Use the Fabrics menu to filter by type.',
  },
  {
    match: ['wholesale', 'bulk', 'reseller'],
    reply: 'Yes, we offer wholesale pricing for bulk orders. Please reach out on WhatsApp with your requirements and we\'ll share a custom quote.',
  },
  {
    match: ['payment', 'pay', 'upi', 'razorpay', 'cod', 'cash on delivery'],
    reply: 'We accept Razorpay (cards, UPI, netbanking) and Cash on Delivery. Select your preferred option at checkout.',
  },
  {
    match: ['hello', 'hi', 'hey', 'namaste', 'hii'],
    reply: 'Hello! 😊 I\'m Fabric Infinity\'s FAQ assistant. Ask me about fabrics, pricing, shipping, returns, or anything else — or use WhatsApp to chat with our team directly.',
  },
];

function getFaqReply(input: string): string {
  const lower = input.toLowerCase();
  for (const { match, reply } of FAQ_RESPONSES) {
    if (match.some(kw => lower.includes(kw))) return reply;
  }
  return "I'm not sure about that one. For detailed queries our team is happy to help — use the WhatsApp tab to chat with us directly!";
}

// ── Email form ───────────────────────────────────────────────────────────────
type EmailState = 'idle' | 'sending' | 'sent' | 'error';

function EmailTab() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState<EmailState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setState('error');
      } else {
        setState('sent');
        setForm({ name: '', email: '', message: '' });
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <div className="p-6 flex flex-col items-center text-center gap-3">
        <div className="text-4xl">✅</div>
        <p className="font-semibold text-gray-800">Message received!</p>
        <p className="text-gray-500 text-sm">We'll reply to your email within 24 hours.</p>
        <button
          onClick={() => setState('idle')}
          className="mt-2 text-sm text-[#F97316] underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
          {errorMsg}
        </div>
      )}
      <input
        type="text"
        placeholder="Your name"
        required
        value={form.name}
        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
      />
      <input
        type="email"
        placeholder="Email address"
        required
        value={form.email}
        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
      />
      <textarea
        placeholder="How can we help you?"
        required
        rows={3}
        value={form.message}
        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors resize-none"
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full py-2.5 rounded-lg bg-[#F97316] text-white font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Send size={14} />
        {state === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('whatsapp');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hello! 👋 I'm Fabric Infinity's FAQ assistant. Ask me about fabrics, pricing, shipping, or returns. For complex queries, switch to WhatsApp." },
  ]);
  const [input, setInput] = useState('');
  const [faqLoading, setFaqLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleWhatsApp = () => {
    if (!WA_NUMBER) return;
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello Fabric Infinity! I need help.')}`,
      '_blank',
    );
  };

  const handleFaqSend = async () => {
    if (!input.trim() || faqLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setFaqLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setMessages(prev => [...prev, { role: 'bot', text: getFaqReply(userMsg) }]);
    setFaqLoading(false);
  };

  const TABS: Array<{ id: Tab; label: string; emoji: string }> = [
    { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
    { id: 'email', label: 'Email', emoji: '✉️' },
    { id: 'faq', label: 'FAQ Bot', emoji: '🤖' },
  ];

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white flex flex-col"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="bg-[#F97316] px-5 py-4">
            <p className="text-white font-bold text-lg">Hi there 👋</p>
            <p className="text-orange-100 text-sm">We are here. Happy to help!</p>
          </div>

          {/* Brand card */}
          <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Fabric Infinity" className="w-11 h-11 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Fabric Infinity</p>
              <p className="text-gray-500 text-xs">
                Sales &amp; Support ·{' '}
                <span className="text-green-600 font-medium">Online now</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-white">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                  tab === t.id
                    ? 'text-[#F97316] border-b-2 border-[#F97316]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="text-base leading-none">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* WhatsApp tab */}
            {tab === 'whatsapp' && (
              <div className="p-5 flex flex-col items-center gap-5">
                <p className="text-gray-500 text-sm text-center leading-relaxed">
                  Chat with us directly on WhatsApp. We typically reply within a few minutes.
                </p>
                {WA_NUMBER ? (
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-3 rounded-full bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#1fbb58] transition-colors shadow-md text-sm"
                  >
                    {/* WhatsApp SVG icon */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.707a.5.5 0 0 0 .638.558l6.01-1.894A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 0 1-5.002-1.37l-.358-.214-3.707 1.167 1.098-3.61-.233-.373A9.815 9.815 0 0 1 2.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z" />
                    </svg>
                    Chat on WhatsApp
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center">
                    WhatsApp not configured. Set <code>VITE_WHATSAPP_NUMBER</code> in environment variables.
                  </p>
                )}
                <p className="text-gray-400 text-xs text-center">Available Mon–Sat, 10 am–7 pm IST</p>
              </div>
            )}

            {/* Email tab */}
            {tab === 'email' && <EmailTab />}

            {/* FAQ Bot tab */}
            {tab === 'faq' && (
              <div className="flex flex-col h-72">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {m.role === 'bot' && (
                        <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">
                          FAQ
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#F97316] text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {faqLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        FAQ
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <p className="text-[10px] text-gray-400 text-center pb-1">
                  Automated FAQ assistant — for complex queries use WhatsApp
                </p>
                <div className="border-t border-gray-100 p-3 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFaqSend()}
                    placeholder="Ask about fabrics, shipping…"
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                  />
                  <button
                    onClick={handleFaqSend}
                    disabled={!input.trim() || faqLoading}
                    className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center disabled:opacity-40 hover:bg-orange-600 transition-colors"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#F97316] shadow-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
        aria-label={open ? 'Close chat' : 'Chat with us'}
      >
        {open ? (
          <X size={22} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white" />
        )}
      </button>
    </>
  );
}

import { useState } from 'react';
import { X, MessageCircle, Mail, Bot, Send } from 'lucide-react';
import logo from '@assets/codex-clipboard-ba1642ba-86e7-4917-8383-f749aa153b92_1785595081553.jpg';

type Tab = 'whatsapp' | 'email' | 'ai';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const WHATSAPP_NUMBER = '919876543210'; // Replace with actual number

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('whatsapp');
  const [emailForm, setEmailForm] = useState({ name: '', email: '', message: '' });
  const [emailSent, setEmailSent] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! 👋 How can I help you today? Ask me about our fabrics, pricing, or shipping.' },
  ]);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20Fabric%20Infinity!%20I%20need%20help.`, '_blank');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to your backend
    console.log('Email inquiry:', emailForm);
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 4000);
    setEmailForm({ name: '', email: '', message: '' });
  };

  const handleAiSend = async () => {
    if (!input.trim() || aiLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    // Simple keyword-based responses — swap for real AI API call in production
    await new Promise(r => setTimeout(r, 800));
    let reply = "I'm here to help! For detailed queries, please use WhatsApp or Email.";
    const lower = userMsg.toLowerCase();
    if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
      reply = 'Our fabrics start from ₹299/metre. Pricing varies by fabric type. Browse our Shop page for exact prices!';
    } else if (lower.includes('ship') || lower.includes('deliver')) {
      reply = 'We deliver pan-India! Orders above ₹999 get free shipping. Standard delivery takes 5–7 business days.';
    } else if (lower.includes('return') || lower.includes('exchange')) {
      reply = 'We accept returns within 7 days of delivery for unused, uncut fabric in original condition.';
    } else if (lower.includes('ajrakh') || lower.includes('ikat') || lower.includes('block print')) {
      reply = 'We carry authentic hand block prints, Ajrakh (cotton & modal silk), Ikat varieties, and much more. All ethically sourced!';
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      reply = 'Hello! 😊 I\'m the Fabric Infinity assistant. Ask me about fabrics, prices, shipping, or returns!';
    } else if (lower.includes('saree') || lower.includes('dupatta') || lower.includes('suit')) {
      reply = 'We have a beautiful collection of sarees, dupattas, and dress materials. Visit our Shop to browse all categories!';
    }
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setAiLoading(false);
  };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white flex flex-col"
          style={{ maxHeight: 'calc(100vh - 120px)' }}>
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
              <p className="text-gray-500 text-xs">Sales &amp; Support · <span className="text-green-600 font-medium">Online now</span></p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-white">
            {([
              { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
              { id: 'email', label: 'Email', icon: '✉️' },
              { id: 'ai', label: 'AI Chat', icon: '🤖' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  tab === t.id
                    ? 'text-[#F97316] border-b-2 border-[#F97316]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* WhatsApp tab */}
            {tab === 'whatsapp' && (
              <div className="p-5 flex flex-col items-center gap-5">
                <p className="text-gray-500 text-sm text-center leading-relaxed">
                  Chat with us directly on WhatsApp. We typically reply within a few minutes.
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3 rounded-full bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#1fbb58] transition-colors shadow-md text-sm"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.556 4.118 1.528 5.845L.057 23.707a.5.5 0 0 0 .638.558l6.01-1.894A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 0 1-5.002-1.37l-.358-.214-3.707 1.167 1.098-3.61-.233-.373A9.815 9.815 0 0 1 2.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
                  </svg>
                  Chat on WhatsApp
                </button>
                <p className="text-gray-400 text-xs text-center">Available Mon–Sat, 10am–7pm IST</p>
              </div>
            )}

            {/* Email tab */}
            {tab === 'email' && (
              <div className="p-4">
                {emailSent ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="font-semibold text-gray-800">Message sent!</p>
                    <p className="text-gray-500 text-sm mt-1">We'll reply within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      required
                      value={emailForm.name}
                      onChange={e => setEmailForm(p => ({ ...p, name: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      required
                      value={emailForm.email}
                      onChange={e => setEmailForm(p => ({ ...p, email: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                    />
                    <textarea
                      placeholder="How can we help you?"
                      required
                      rows={3}
                      value={emailForm.message}
                      onChange={e => setEmailForm(p => ({ ...p, message: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] resize-none"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-[#F97316] text-white font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={14} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* AI Chat tab */}
            {tab === 'ai' && (
              <div className="flex flex-col h-64">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'bot' && (
                        <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot size={14} className="text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#F97316] text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
                        <span className="flex gap-1 items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 p-3 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-[#F97316]"
                  />
                  <button
                    onClick={handleAiSend}
                    disabled={!input.trim() || aiLoading}
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
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#F97316] shadow-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center hover:scale-105"
        aria-label="Chat with us"
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

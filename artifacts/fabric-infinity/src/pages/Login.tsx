import { useState } from 'react';
import { useLocation } from 'wouter';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logo from '@assets/codex-clipboard-ba1642ba-86e7-4917-8383-f749aa153b92_1785595081553.jpg';

type Step = 'input' | 'otp';
type Method = 'phone' | 'email';

export default function Login() {
  const [step, setStep] = useState<Step>('input');
  const [method, setMethod] = useState<Method>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = method === 'phone' ? { phone } : { email };
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setDemoOtp(data.demo_otp || '');
      setStep('otp');
      toast({ title: 'OTP sent', description: data.message });
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = method === 'phone' ? { phone, otp } : { email, otp };
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      toast({ title: 'Welcome to Fabric Infinity!' });
      setLocation('/');
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Invalid OTP', description: err instanceof Error ? err.message : 'Verification failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-muted/20 py-16 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Fabric Infinity" className="w-16 h-16 rounded-full mb-4 shadow-md" />
              <h1 className="font-serif text-2xl font-bold text-foreground">Sign in to your account</h1>
              <p className="text-muted-foreground text-sm mt-1 text-center">Use your phone or email to continue</p>
            </div>

            {step === 'input' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMethod('phone')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'phone' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Mobile Number
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('email')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'email' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Email
                  </button>
                </div>

                {method === 'phone' ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="flex gap-2">
                      <span className="flex items-center px-3 border border-border rounded-md bg-muted text-sm text-muted-foreground">+91</span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        required
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-otp">
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    OTP sent to <span className="font-semibold text-foreground">{method === 'phone' ? `+91 ${phone}` : email}</span>
                  </p>
                  {demoOtp && (
                    <div className="mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                      Demo OTP: <span className="font-bold tracking-widest">{demoOtp}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="------"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    className="text-center text-2xl tracking-[0.5em] font-bold"
                    data-testid="input-otp"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6} data-testid="button-verify-otp">
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep('input'); setOtp(''); setDemoOtp(''); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Change {method === 'phone' ? 'number' : 'email'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}

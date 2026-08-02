import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminLogin } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import logo from '@assets/codex-clipboard-ba1642ba-86e7-4917-8383-f749aa153b92_1785595081553.jpg';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const loginMutation = useAdminLogin();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({ data });
      setLocation('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Invalid password',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Fabric Infinity" className="w-16 h-16 rounded-full mb-4" />
          <h1 className="font-serif text-2xl font-bold text-primary">Admin Portal</h1>
          <p className="text-muted-foreground mt-2">Enter your password to access the dashboard</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full font-medium" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

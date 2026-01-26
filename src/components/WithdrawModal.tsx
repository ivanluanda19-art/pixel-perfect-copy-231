import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Phone, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  phone_number: string | null;
  requested_at: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onSuccess: () => void;
}

const withdrawSchema = z.object({
  amount: z.number().min(500, 'Valor mínimo é Kz 500,00').max(100000, 'Valor máximo é Kz 100.000,00'),
  phoneNumber: z.string().min(9, 'Número de telefone inválido').max(15),
  paymentMethod: z.string().min(1, 'Selecione um método de pagamento'),
});

const WithdrawModal = ({ isOpen, onClose, balance, onSuccess }: WithdrawModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('unitel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchWithdrawals();
    }
  }, [isOpen, user]);

  const fetchWithdrawals = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching withdrawals:', error);
    } else {
      setWithdrawals(data || []);
    }
    setIsLoadingHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    
    const validation = withdrawSchema.safeParse({
      amount: amountNum,
      phoneNumber,
      paymentMethod,
    });

    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: 'Erro de validação',
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (amountNum > balance) {
      toast({
        variant: 'destructive',
        title: 'Saldo insuficiente',
        description: `Seu saldo atual é Kz ${balance.toFixed(2)}`,
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user?.id,
        amount: amountNum,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao solicitar saque',
        description: error.message,
      });
    } else {
      toast({
        title: 'Saque solicitado!',
        description: 'Seu saque será processado em até 24 horas.',
      });
      setAmount('');
      setPhoneNumber('');
      onSuccess();
      fetchWithdrawals();
    }

    setIsSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Pendente';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass border-border/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Sacar Dinheiro
          </DialogTitle>
          <DialogDescription>
            Saldo disponível: <span className="font-semibold text-primary">Kz {balance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="withdraw" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="withdraw">Solicitar Saque</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="withdraw" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['unitel', 'africell'].map((method) => (
                    <Card
                      key={method}
                      className={`cursor-pointer transition-all ${
                        paymentMethod === method 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border/50 hover:border-primary/50'
                      }`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <CardContent className="flex items-center justify-center p-3">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="capitalize font-medium">{method} Money</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (Kz)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="500"
                  step="0.01"
                  className="bg-background/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo: Kz 500,00 | Máximo: Kz 100.000,00
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="923 456 789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting || balance < 500}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Solicitar Saque'
                )}
              </Button>

              {balance < 500 && (
                <p className="text-xs text-destructive text-center">
                  Saldo mínimo para saque é Kz 500,00
                </p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : withdrawals.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {withdrawals.map((withdrawal) => (
                  <Card key={withdrawal.id} className="border-border/50">
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-semibold">Kz {withdrawal.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(withdrawal.requested_at).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className="text-sm">{getStatusText(withdrawal.status)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum saque realizado ainda
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;

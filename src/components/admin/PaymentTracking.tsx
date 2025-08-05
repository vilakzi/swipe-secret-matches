import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PaymentOverview {
  id: string;
  provider_id: string;
  display_name: string;
  email: string;
  amount: number;
  currency: string;
  payment_status: string;
  promotion_hours: number;
  created_at: string;
  updated_at: string;
}

const PaymentTracking = () => {
  const [payments, setPayments] = React.useState<PaymentOverview[]>([]);
  const [filteredPayments, setFilteredPayments] = React.useState<PaymentOverview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    fetchPayments();
  }, []);

  React.useEffect(() => {
    const filtered = payments.filter(payment =>
      payment.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
  }, [payments, searchTerm]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_payment_overview')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error loading payments",
        description: "Failed to load payment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'failed':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const totalRevenue = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-700 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              R{(totalRevenue / 100).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Transactions
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {payments.length.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-md border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Completed Payments
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {payments.filter(p => p.payment_status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="bg-black/20 backdrop-blur-md border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Payment Transactions</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Promotion</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">
                          {payment.display_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-400">{payment.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">
                        R{(payment.amount / 100).toLocaleString()} {payment.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(payment.payment_status)} text-white`}>
                        {getStatusIcon(payment.payment_status)}
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-300">
                        {payment.promotion_hours}h promotion
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-300">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTracking;

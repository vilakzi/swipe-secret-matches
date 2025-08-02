
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';

const SignupForm = () => {
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    displayName: '',
    phone: '',
    userType: 'user' as 'user' | 'service_provider'
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const { loading, handleSubmit } = useAuthHandlers();

  const onSubmit = async (e: React.FormEvent) => {
    if (!formData.email || !formData.password || !formData.displayName || !formData.phone) {
      return;
    }

    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      return;
    }

    await handleSubmit(e, false, formData.email, formData.password, formData.displayName, formData.userType, false, formData.phone);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/20 backdrop-blur-md border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-center">Create Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="+27 12 345 6789"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +27 for South Africa)</p>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-800/50 border-gray-600 text-white pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Account Type</Label>
            <Select value={formData.userType} onValueChange={(value) => setFormData(prev => ({ ...prev, userType: value as 'user' | 'service_provider' }))}>
              <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Regular User</SelectItem>
                <SelectItem value="service_provider">Service Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;

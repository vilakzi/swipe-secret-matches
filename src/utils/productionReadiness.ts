import { supabase } from '@/integrations/supabase/client';

export const performProductionChecks = async () => {
  const checks = [];
  
  try {
    // 1. Authentication Check
    const { data: { user } } = await supabase.auth.getUser();
    checks.push({
      name: 'Authentication System',
      status: 'working',
      message: user ? 'User authenticated' : 'No user session'
    });

    // 2. Database Connectivity 
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    checks.push({
      name: 'Database Connection',
      status: profileError ? 'error' : 'working',
      message: profileError ? profileError.message : 'Connected successfully'
    });

    // 3. Content Check
    const { data: posts } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
      
    checks.push({
      name: 'Content Available',
      status: posts && posts.length > 0 ? 'working' : 'warning',
      message: posts && posts.length > 0 ? 'Content found' : 'No content available'
    });

    // 4. Storage Check
    const { data: buckets } = await supabase.storage.listBuckets();
    checks.push({
      name: 'Storage System',
      status: buckets ? 'working' : 'error',
      message: buckets ? `${buckets.length} buckets configured` : 'Storage not accessible'
    });

  } catch (error) {
    checks.push({
      name: 'General System',
      status: 'error',
      message: `System error: ${error}`
    });
  }

  return checks;
};

export const getProductionReadinessScore = (checks: any[]) => {
  const workingChecks = checks.filter(c => c.status === 'working').length;
  return Math.round((workingChecks / checks.length) * 100);
};
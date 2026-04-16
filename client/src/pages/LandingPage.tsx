import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

/**
 * Landing page for Kuaishou ad tracking
 * Receives macro parameters from Kuaishou and stores them in session
 * Then redirects to home page
 */
export default function LandingPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [isProcessing, setIsProcessing] = useState(true);

  // Parse Kuaishou macro parameters
  const params = new URLSearchParams(search);
  const callback = params.get('callback') || '';
  const adid = params.get('adid') || '';

  // Create tracking mutation
  const createTrackingMutation = trpc.kuaishou.createTracking.useMutation({
    onSuccess: () => {
      // Store in session/localStorage for later use during order creation
      if (callback) {
        sessionStorage.setItem('kuaishou_callback', callback);
        sessionStorage.setItem('kuaishou_adid', adid);
      }
      // Redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 500);
    },
    onError: (err) => {
      console.error('Failed to create tracking:', err);
      toast.error('追踪参数保存失败');
      // Still redirect to home even if tracking fails
      setTimeout(() => {
        navigate('/');
      }, 1000);
    },
  });

  useEffect(() => {
    if (callback) {
      // Create tracking record
      createTrackingMutation.mutate({
        callback,
        adid: adid || undefined,
      });
    } else {
      // No callback, just redirect
      setIsProcessing(false);
      navigate('/');
    }
  }, [callback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-xl font-semibold text-foreground mb-2">正在加载...</h1>
        <p className="text-sm text-muted-foreground">
          {callback ? '正在记录您的访问信息...' : '准备进入首页...'}
        </p>
      </div>
    </div>
  );
}
